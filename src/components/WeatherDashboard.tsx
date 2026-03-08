import { useState, useEffect, useMemo, useCallback } from 'react';

/* ===============================
   TYPE DEFINITIONS
================================ */
interface HourlyWeather {
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    pop: number; // probability of precipitation (0-1)
    rain?: { '3h': number };
    weather: { id: number; main: string; description: string; icon: string }[];
    uvi?: number;
}

interface CurrentWeather {
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    uvi: number;
    weather: { id: number; main: string; description: string; icon: string }[];
}

interface WeatherAPIResponse {
    current: CurrentWeather;
    hourly: HourlyWeather[];
}

interface WeatherDashboardProps {
    lat: number;
    lng: number;
    locationName?: string;
}

type AdvisoryLevel = 'safe' | 'caution' | 'danger';

interface Advisory {
    icon: string;
    title: string;
    message: string;
    level: AdvisoryLevel;
}

/* ===============================
   MOCK DATA (fallback)
================================ */
function generateMockData(lat: number, _lng: number): WeatherAPIResponse {
    const now = Math.floor(Date.now() / 1000);
    const baseTemp = lat > 25 ? 28 + Math.random() * 8 : 32 + Math.random() * 6;

    const current: CurrentWeather = {
        dt: now,
        temp: baseTemp,
        feels_like: baseTemp + 2,
        humidity: 55 + Math.floor(Math.random() * 30),
        wind_speed: 2 + Math.random() * 8,
        uvi: 4 + Math.random() * 6,
        weather: [{ id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' }]
    };

    const hourly: HourlyWeather[] = Array.from({ length: 8 }, (_, i) => {
        const hourTemp = baseTemp + (Math.random() - 0.5) * 6 - (i > 4 ? i * 0.5 : 0);
        const rainChance = Math.random();
        return {
            dt: now + (i + 1) * 3 * 3600, // 3-hour intervals
            temp: Math.round(hourTemp * 10) / 10,
            feels_like: Math.round((hourTemp + 1.5) * 10) / 10,
            humidity: Math.min(100, 50 + Math.floor(Math.random() * 40)),
            wind_speed: Math.round((1.5 + Math.random() * 10) * 10) / 10,
            pop: Math.round(rainChance * 100) / 100,
            rain: rainChance > 0.6 ? { '3h': Math.round(Math.random() * 12 * 10) / 10 } : undefined,
            weather: [
                rainChance > 0.7
                    ? { id: 500, main: 'Rain', description: 'light rain', icon: '10d' }
                    : rainChance > 0.4
                        ? { id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' }
                        : { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }
            ],
            uvi: Math.max(0, 5 + (Math.random() - 0.5) * 8 - i * 0.6),
        };
    });

    return { current, hourly };
}

/* ===============================
   HELPER FUNCTIONS
================================ */
function formatHour(unixTs: number): string {
    return new Date(unixTs * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getWeatherEmoji(weatherId: number): string {
    if (weatherId >= 200 && weatherId < 300) return '⛈️';
    if (weatherId >= 300 && weatherId < 400) return '🌦️';
    if (weatherId >= 500 && weatherId < 600) return '🌧️';
    if (weatherId >= 600 && weatherId < 700) return '❄️';
    if (weatherId >= 700 && weatherId < 800) return '🌫️';
    if (weatherId === 800) return '☀️';
    if (weatherId === 801) return '🌤️';
    if (weatherId >= 802) return '☁️';
    return '🌡️';
}

function advisoryColor(level: AdvisoryLevel): string {
    switch (level) {
        case 'safe': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-800 dark:text-emerald-300';
        case 'caution': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 text-amber-800 dark:text-amber-300';
        case 'danger': return 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-800 dark:text-red-300';
    }
}

function advisoryBadge(level: AdvisoryLevel): string {
    switch (level) {
        case 'safe': return 'bg-emerald-500';
        case 'caution': return 'bg-amber-500';
        case 'danger': return 'bg-red-500';
    }
}

/* ===============================
   AGRICULTURE SCIENCE ENGINE
   Multi-factor scoring with
   weighted calculations
================================ */

// -- Sub-score Types --
interface ScoreFactor {
    name: string;
    icon: string;
    score: number;  // 0-100
    weight: number; // multiplier
    detail: string;
}

interface FieldWorkResult {
    overall: number;
    factors: ScoreFactor[];
}

// -- Heat Index (NWS formula) --
// Combines temperature + humidity to estimate perceived danger for outdoor workers
function calcHeatIndex(tempC: number, rh: number): number {
    const T = tempC * 9 / 5 + 32; // to Fahrenheit
    if (T < 80) return tempC; // formula not accurate below 80°F
    const HI = -42.379 + 2.04901523 * T + 10.14333127 * rh
        - 0.22475541 * T * rh - 0.00683783 * T * T
        - 0.05481717 * rh * rh + 0.00122874 * T * T * rh
        + 0.00085282 * T * rh * rh - 0.00000199 * T * T * rh * rh;
    return (HI - 32) * 5 / 9; // back to Celsius
}

// -- Dew Point (Magnus formula) --
// Used for disease risk: leaf wetness correlates with dew point proximity
function calcDewPoint(tempC: number, rh: number): number {
    const a = 17.27, b = 237.7;
    const alpha = (a * tempC) / (b + tempC) + Math.log(rh / 100);
    return (b * alpha) / (a - alpha);
}

// -- Simplified Evapotranspiration (Hargreaves method) --
// ET₀ ≈ 0.0023 × (Tmean + 17.8) × (Tmax - Tmin)^0.5 × Ra
// Returns mm/day estimate
function calcET0(tMin: number, tMax: number, tMean: number, _lat: number): number {
    const Ra = 15; // approximate extraterrestrial radiation for tropical/subtropical India (MJ/m²/day)
    const tRange = Math.max(0.1, tMax - tMin);
    return 0.0023 * (tMean + 17.8) * Math.sqrt(tRange) * Ra * 0.408; // 0.408 converts MJ to mm
}

// -- Temperature Stress Score --
// Gaussian curve: optimal at 22-28°C, penalties increase exponentially outside
function tempStressScore(temps: number[]): { score: number; detail: string } {
    const optimal = 25; // optimal crop growth temp
    const sigma = 10;   // spread of tolerance
    const avgTemp = temps.reduce((s, t) => s + t, 0) / temps.length;
    const deviation = Math.abs(avgTemp - optimal);
    const gaussian = Math.exp(-0.5 * (deviation / sigma) ** 2) * 100;

    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);

    // Extra penalties for extremes
    let penalty = 0;
    if (minT < 2) penalty += 30;       // severe frost
    else if (minT < 5) penalty += 15;  // frost risk
    if (maxT > 42) penalty += 25;      // severe heat
    else if (maxT > 38) penalty += 12; // heat stress

    const score = Math.max(0, Math.min(100, Math.round(gaussian - penalty)));
    let detail = `Avg ${avgTemp.toFixed(1)}°C (range ${minT.toFixed(0)}–${maxT.toFixed(0)}°C)`;
    if (minT < 5) detail += ' ⚠️ Frost risk';
    if (maxT > 38) detail += ' ⚠️ Heat stress';
    return { score, detail };
}

// -- Precipitation Risk Score --
// Weighted cumulative rain probability + actual rainfall volume
function precipRiskScore(forecast: HourlyWeather[]): { score: number; detail: string } {
    const avgPop = forecast.reduce((s, h) => s + h.pop, 0) / forecast.length;
    const totalRain = forecast.reduce((s, h) => s + (h.rain?.['3h'] || 0), 0);
    const heavyPeriods = forecast.filter(h => (h.rain?.['3h'] || 0) > 5).length;

    let score = 100;
    score -= avgPop * 50;                    // probability penalty
    score -= Math.min(30, totalRain * 2);    // volume penalty (capped at 30)
    score -= heavyPeriods * 10;              // heavy rain extra penalty

    score = Math.max(0, Math.min(100, Math.round(score)));
    const detail = `${Math.round(avgPop * 100)}% avg chance, ${totalRain.toFixed(1)}mm total`;
    return { score, detail };
}

// -- Wind Impact Score --
// Based on Beaufort scale thresholds relevant to farming operations
function windImpactScore(forecast: HourlyWeather[]): { score: number; detail: string } {
    const speeds = forecast.map(h => h.wind_speed);
    const avg = speeds.reduce((s, v) => s + v, 0) / speeds.length;
    const max = Math.max(...speeds);
    const gustVariance = speeds.reduce((s, v) => s + (v - avg) ** 2, 0) / speeds.length;

    let score = 100;
    // Beaufort-based penalties
    if (avg > 20) score -= 40;       // strong breeze
    else if (avg > 15) score -= 25;  // fresh breeze
    else if (avg > 10) score -= 12;  // moderate breeze
    else if (avg > 6) score -= 5;    // gentle breeze

    // Gust penalty (high variance = unpredictable)
    score -= Math.min(15, gustVariance * 0.3);
    // Max wind penalty
    if (max > 25) score -= 15;

    score = Math.max(0, Math.min(100, Math.round(score)));
    const detail = `Avg ${avg.toFixed(1)} km/h, gusts up to ${max.toFixed(0)} km/h`;
    return { score, detail };
}

// -- Humidity Stress Score --
// Both too high (disease risk) and too low (wilting) are penalized
function humidityStressScore(forecast: HourlyWeather[], temps: number[]): { score: number; detail: string } {
    const humidities = forecast.map(h => h.humidity);
    const avg = humidities.reduce((s, h) => s + h, 0) / humidities.length;

    let score = 100;
    // High humidity penalty (disease risk escalates with warmth)
    const highHumPeriods = forecast.filter((h, i) => h.humidity > 85 && temps[i] > 15 && temps[i] < 30).length;
    score -= highHumPeriods * 8;

    // Very high sustained humidity
    if (avg > 90) score -= 20;
    else if (avg > 80) score -= 10;

    // Too dry penalty (crop stress)
    if (avg < 30) score -= 15;
    else if (avg < 40) score -= 8;

    // Dew point check (leaf wetness proxy)
    const avgTemp = temps.reduce((s, t) => s + t, 0) / temps.length;
    const dewPoint = calcDewPoint(avgTemp, avg);
    const dewPointSpread = avgTemp - dewPoint;
    if (dewPointSpread < 3) score -= 10; // very likely condensation

    score = Math.max(0, Math.min(100, Math.round(score)));
    const detail = `Avg ${avg.toFixed(0)}%, dew point ${dewPoint.toFixed(0)}°C (spread ${dewPointSpread.toFixed(0)}°C)`;
    return { score, detail };
}

// -- Worker Safety Score --
// Heat Index based assessment for outdoor labor safety
function workerSafetyScore(current: CurrentWeather, forecast: HourlyWeather[]): { score: number; detail: string } {
    const heatIdx = calcHeatIndex(current.temp, current.humidity);
    const avgTemp = forecast.reduce((s, h) => s + h.temp, 0) / forecast.length;
    const avgHum = forecast.reduce((s, h) => s + h.humidity, 0) / forecast.length;
    const forecastHeatIdx = calcHeatIndex(avgTemp, avgHum);

    const peakHI = Math.max(heatIdx, forecastHeatIdx);

    let score = 100;
    // NWS Heat Index categories
    if (peakHI > 54) score = 0;         // Extreme danger
    else if (peakHI > 41) score -= 50;  // Danger
    else if (peakHI > 33) score -= 25;  // Extreme caution
    else if (peakHI > 27) score -= 10;  // Caution

    // Cold stress
    if (current.temp < 5) score -= 30;
    else if (current.temp < 10) score -= 10;

    score = Math.max(0, Math.min(100, Math.round(score)));
    let detail = `Heat index ${peakHI.toFixed(0)}°C`;
    if (peakHI > 41) detail += ' — DANGEROUS for outdoor work';
    else if (peakHI > 33) detail += ' — take frequent breaks';
    else if (current.temp < 5) detail = `Cold stress risk at ${current.temp.toFixed(0)}°C`;
    else detail += ' — safe for outdoor labor';
    return { score, detail };
}

// -- Soil Workability Score --
// Based on rainfall impact on soil moisture — too wet = can't plough/harvest
function soilWorkabilityScore(forecast: HourlyWeather[]): { score: number; detail: string } {
    const totalRain = forecast.reduce((s, h) => s + (h.rain?.['3h'] || 0), 0);
    const recentHeavyRain = forecast.slice(0, 3).reduce((s, h) => s + (h.rain?.['3h'] || 0), 0);
    const avgHumidity = forecast.reduce((s, h) => s + h.humidity, 0) / forecast.length;

    let score = 100;
    // Recent/imminent rain makes soil unworkable
    if (recentHeavyRain > 10) score -= 40;
    else if (recentHeavyRain > 5) score -= 25;
    else if (recentHeavyRain > 2) score -= 10;

    // Total predicted rain
    score -= Math.min(20, totalRain * 1.5);

    // High humidity = slow drying
    if (avgHumidity > 85) score -= 15;
    else if (avgHumidity > 75) score -= 5;

    score = Math.max(0, Math.min(100, Math.round(score)));
    let detail: string;
    if (score >= 80) detail = 'Soil conditions likely firm and workable';
    else if (score >= 50) detail = `${totalRain.toFixed(1)}mm rain — soil may be damp`;
    else detail = `${totalRain.toFixed(1)}mm rain — soil too wet for machinery`;
    return { score, detail };
}

// -- Evapotranspiration Score --
// Water balance: ET₀ vs expected rainfall
function etScore(forecast: HourlyWeather[]): { score: number; detail: string; etMm: number } {
    const temps = forecast.map(h => h.temp);
    const tMin = Math.min(...temps);
    const tMax = Math.max(...temps);
    const tMean = temps.reduce((s, t) => s + t, 0) / temps.length;
    const et0 = calcET0(tMin, tMax, tMean, 20); // approximate for India
    const totalRain = forecast.reduce((s, h) => s + (h.rain?.['3h'] || 0), 0);
    const waterDeficit = et0 - totalRain;

    // Score: irrigation urgency (higher deficit = lower score = more urgent)
    let score = 100;
    if (waterDeficit > 5) score -= 40;
    else if (waterDeficit > 3) score -= 25;
    else if (waterDeficit > 1) score -= 10;
    else if (waterDeficit < -5) score -= 15; // waterlogging risk

    score = Math.max(0, Math.min(100, Math.round(score)));
    const detail = `ET₀ ≈ ${et0.toFixed(1)}mm/day, rain ${totalRain.toFixed(1)}mm, deficit ${waterDeficit.toFixed(1)}mm`;
    return { score, detail, etMm: et0 };
}

// -- Weather Stability Score --
// How consistent/predictable the weather is (variance-based)
function stabilityScore(forecast: HourlyWeather[]): { score: number; detail: string } {
    const temps = forecast.map(h => h.temp);
    const pops = forecast.map(h => h.pop);
    const winds = forecast.map(h => h.wind_speed);

    const tempMean = temps.reduce((s, t) => s + t, 0) / temps.length;
    const tempVar = temps.reduce((s, t) => s + (t - tempMean) ** 2, 0) / temps.length;

    const popMean = pops.reduce((s, p) => s + p, 0) / pops.length;
    const popVar = pops.reduce((s, p) => s + (p - popMean) ** 2, 0) / pops.length;

    const windMean = winds.reduce((s, w) => s + w, 0) / winds.length;
    const windVar = winds.reduce((s, w) => s + (w - windMean) ** 2, 0) / winds.length;

    let score = 100;
    score -= Math.min(25, tempVar * 2);   // temperature swings
    score -= Math.min(30, popVar * 100);  // rain predictability
    score -= Math.min(20, windVar * 1.5); // wind gusts

    score = Math.max(0, Math.min(100, Math.round(score)));
    let detail: string;
    if (score >= 80) detail = 'Stable, predictable conditions';
    else if (score >= 50) detail = 'Some variability — monitor for changes';
    else detail = 'Highly unstable — plan cautiously';
    return { score, detail };
}

/* ===============================
   COMPOSITE FIELD WORK SCORE
   Weighted multi-factor calculation
================================ */
function calculateFieldWorkScore(current: CurrentWeather, next8: HourlyWeather[]): FieldWorkResult {
    const temps = next8.map(h => h.temp);

    const tempFactor = tempStressScore(temps);
    const precipFactor = precipRiskScore(next8);
    const windFactor = windImpactScore(next8);
    const humFactor = humidityStressScore(next8, temps);
    const safetyFactor = workerSafetyScore(current, next8);
    const soilFactor = soilWorkabilityScore(next8);
    const etFactor = etScore(next8);
    const stabFactor = stabilityScore(next8);

    const factors: ScoreFactor[] = [
        { name: 'Temperature',      icon: '🌡️', score: tempFactor.score,   weight: 0.15, detail: tempFactor.detail },
        { name: 'Precipitation',     icon: '🌧️', score: precipFactor.score, weight: 0.18, detail: precipFactor.detail },
        { name: 'Wind Conditions',   icon: '💨', score: windFactor.score,   weight: 0.12, detail: windFactor.detail },
        { name: 'Humidity & Dew',    icon: '💧', score: humFactor.score,    weight: 0.12, detail: humFactor.detail },
        { name: 'Worker Safety',     icon: '👷', score: safetyFactor.score, weight: 0.15, detail: safetyFactor.detail },
        { name: 'Soil Workability',  icon: '🚜', score: soilFactor.score,   weight: 0.13, detail: soilFactor.detail },
        { name: 'Water Balance (ET)',icon: '🌊', score: etFactor.score,     weight: 0.08, detail: etFactor.detail },
        { name: 'Weather Stability', icon: '📊', score: stabFactor.score,   weight: 0.07, detail: stabFactor.detail },
    ];

    // Weighted average
    const overall = Math.round(
        factors.reduce((s, f) => s + f.score * f.weight, 0) /
        factors.reduce((s, f) => s + f.weight, 0)
    );

    return { overall: Math.max(0, Math.min(100, overall)), factors };
}

/* ===============================
   ENHANCED ADVISORY ENGINE
================================ */
function computeAdvisories(current: CurrentWeather, next8: HourlyWeather[]): Advisory[] {
    const advisories: Advisory[] = [];
    const temps = next8.map(h => h.temp);
    const tMean = temps.reduce((s, t) => s + t, 0) / temps.length;

    // 1. Irrigation Advisory (ET-based)
    const et = etScore(next8);
    const totalRain = next8.reduce((sum, h) => sum + (h.rain?.['3h'] || 0), 0);
    const waterDeficit = et.etMm - totalRain;
    if (totalRain > 5 && next8.filter(h => h.pop > 0.5).length >= 2) {
        advisories.push({
            icon: '🚿', title: 'Skip Irrigation',
            message: `Rain expected (${totalRain.toFixed(1)}mm). ET₀ is ${et.etMm.toFixed(1)}mm/day — rainfall will cover crop water needs.`,
            level: 'safe'
        });
    } else if (waterDeficit > 3) {
        advisories.push({
            icon: '💧', title: 'Irrigate Immediately',
            message: `Water deficit of ${waterDeficit.toFixed(1)}mm. ET₀ is ${et.etMm.toFixed(1)}mm/day but only ${totalRain.toFixed(1)}mm rain expected. Crops will experience water stress.`,
            level: 'danger'
        });
    } else if (waterDeficit > 1) {
        advisories.push({
            icon: '💧', title: 'Plan Irrigation',
            message: `Mild water deficit (${waterDeficit.toFixed(1)}mm). Monitor soil moisture and irrigate if needed by evening.`,
            level: 'caution'
        });
    } else {
        advisories.push({
            icon: '🚿', title: 'Water Balance OK',
            message: `ET₀ is ${et.etMm.toFixed(1)}mm/day. Expected rainfall is adequate. Follow regular schedule.`,
            level: 'safe'
        });
    }

    // 2. Spray Window (enhanced with drift + evaporation + rainfast)
    const avgWind = next8.slice(0, 3).reduce((s, h) => s + h.wind_speed, 0) / 3;
    const nearRain = next8.slice(0, 3).some(h => h.pop > 0.4);
    const avgHum = next8.slice(0, 3).reduce((s, h) => s + h.humidity, 0) / 3;
    const inversionRisk = avgWind < 2 && avgHum > 80; // temperature inversion = spray trapped at ground level
    if (avgWind >= 3 && avgWind <= 8 && !nearRain && avgHum >= 40 && avgHum <= 80 && !inversionRisk) {
        advisories.push({
            icon: '🧪', title: 'Spray Window: IDEAL',
            message: `Perfect conditions — wind ${avgWind.toFixed(1)} km/h (optimal 3-8), humidity ${avgHum.toFixed(0)}% (40-80%), no rain for ${next8.filter(h => h.pop < 0.3).length * 3}h. Spray will dry and absorb well.`,
            level: 'safe'
        });
    } else if (avgWind > 12 || nearRain || inversionRisk) {
        const reasons = [];
        if (avgWind > 12) reasons.push(`high wind (${avgWind.toFixed(0)} km/h) causing >70% spray drift`);
        if (nearRain) reasons.push('rain within 9h will wash off chemicals');
        if (inversionRisk) reasons.push('temperature inversion trapping spray near ground');
        advisories.push({
            icon: '🚫', title: 'Spray Window: CLOSED',
            message: `Do NOT spray — ${reasons.join('; ')}. Chemical efficacy will be severely reduced.`,
            level: 'danger'
        });
    } else {
        advisories.push({
            icon: '⚠️', title: 'Spray Window: MARGINAL',
            message: `Wind ${avgWind.toFixed(1)} km/h, humidity ${avgHum.toFixed(0)}%. Use coarser nozzles, reduce boom height, and apply downwind.`,
            level: 'caution'
        });
    }

    // 3. Disease Pressure (TOM-CAST inspired model)
    const avgDewPoint = calcDewPoint(tMean, next8.reduce((s, h) => s + h.humidity, 0) / next8.length);
    const leafWetPeriods = next8.filter((h, i) => {
        const dp = calcDewPoint(temps[i], h.humidity);
        return (temps[i] - dp) < 3 || h.humidity > 90 || h.pop > 0.5;
    }).length;
    const diseaseTemp = next8.filter(h => h.temp > 15 && h.temp < 28).length;
    const diseaseSeverity = (leafWetPeriods * diseaseTemp) / (next8.length * next8.length) * 100;

    if (diseaseSeverity > 40) {
        advisories.push({
            icon: '🦠', title: 'HIGH Disease Pressure',
            message: `${leafWetPeriods} periods of leaf wetness with favorable temps (15-28°C). Dew point ${avgDewPoint.toFixed(0)}°C. High risk of blight, anthracnose, downy mildew. Apply preventive fungicide immediately.`,
            level: 'danger'
        });
    } else if (diseaseSeverity > 15) {
        advisories.push({
            icon: '🔬', title: 'Moderate Disease Risk',
            message: `${leafWetPeriods} leaf-wet periods detected. Monitor for early symptoms — leaf spots, wilting, discoloration. Scout fields morning and evening.`,
            level: 'caution'
        });
    } else {
        advisories.push({
            icon: '🛡️', title: 'Low Disease Risk',
            message: `Dew point spread >3°C, low leaf wetness expected. Conditions unfavorable for most pathogens.`,
            level: 'safe'
        });
    }

    // 4. Heat / Frost Alert (with Heat Index)
    const heatIdx = calcHeatIndex(current.temp, current.humidity);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    if (minTemp < 2) {
        advisories.push({
            icon: '🥶', title: 'SEVERE Frost Warning',
            message: `Min temp dropping to ${minTemp.toFixed(1)}°C. Use row covers, mulch, and smudge pots. Move potted plants indoors. Irrigate before frost for thermal mass.`,
            level: 'danger'
        });
    } else if (minTemp < 5) {
        advisories.push({
            icon: '❄️', title: 'Frost Advisory',
            message: `Min temp ${minTemp.toFixed(1)}°C. Tender crops at risk. Apply anti-transpirant spray and ensure adequate soil moisture for insulation.`,
            level: 'caution'
        });
    } else if (heatIdx > 41) {
        advisories.push({
            icon: '🔥', title: 'EXTREME Heat Alert',
            message: `Heat index ${heatIdx.toFixed(0)}°C (temp ${maxTemp.toFixed(0)}°C + humidity). Worker heat stroke risk. Limit outdoor work to early morning only. Deep irrigation and mulching essential.`,
            level: 'danger'
        });
    } else if (heatIdx > 33) {
        advisories.push({
            icon: '🌡️', title: 'Heat Caution',
            message: `Heat index ${heatIdx.toFixed(0)}°C. Workers: 15-min breaks every hour, hydrate constantly. Crops: monitor for leaf curl, wilting, sunscald.`,
            level: 'caution'
        });
    } else {
        advisories.push({
            icon: '✅', title: 'Temperature Safe',
            message: `Range ${minTemp.toFixed(0)}–${maxTemp.toFixed(0)}°C, heat index ${heatIdx.toFixed(0)}°C. Comfortable for both crops and workers.`,
            level: 'safe'
        });
    }

    // 5. Harvest Window
    const harvestHumidity = next8.reduce((s, h) => s + h.humidity, 0) / next8.length;
    const harvestRainRisk = next8.filter(h => h.pop > 0.3).length;
    if (harvestHumidity < 65 && harvestRainRisk <= 1 && avgWind < 15) {
        advisories.push({
            icon: '🌾', title: 'Harvest: GOOD Window',
            message: `Low humidity (${harvestHumidity.toFixed(0)}%), minimal rain risk. Grain will dry well. Ideal for wheat, rice, maize harvest and threshing.`,
            level: 'safe'
        });
    } else if (harvestRainRisk >= 4 || harvestHumidity > 85) {
        advisories.push({
            icon: '⏸️', title: 'Harvest: POSTPONE',
            message: `High humidity (${harvestHumidity.toFixed(0)}%) and ${harvestRainRisk} rain periods. Grain won't dry properly, risk of mold and sprouting. Wait for a clear window.`,
            level: 'danger'
        });
    } else {
        advisories.push({
            icon: '🌾', title: 'Harvest: FAIR Window',
            message: `Moderate conditions. Harvest if urgent, but plan for additional drying time. Use mechanical dryers if available.`,
            level: 'caution'
        });
    }

    // 6. Soil & Field Operations
    const soil = soilWorkabilityScore(next8);
    if (soil.score >= 75) {
        advisories.push({
            icon: '🚜', title: 'Fieldwork: GO',
            message: `${soil.detail}. Good conditions for ploughing, sowing, transplanting, and machinery operations.`,
            level: 'safe'
        });
    } else if (soil.score < 40) {
        advisories.push({
            icon: '🏠', title: 'Fieldwork: POSTPONE',
            message: `${soil.detail}. Heavy machinery will compact wet soil, damaging structure. Plan indoor tasks.`,
            level: 'danger'
        });
    } else {
        advisories.push({
            icon: '⚠️', title: 'Fieldwork: CAUTION',
            message: `${soil.detail}. Light tasks OK, avoid heavy tillage. Check soil ball test before using tractors.`,
            level: 'caution'
        });
    }

    return advisories;
}

function scoreColor(score: number): string {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    if (score >= 25) return '#f97316';
    return '#ef4444';
}

function scoreLabel(score: number): string {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Moderate';
    if (score >= 25) return 'Poor';
    return 'Avoid';
}

function factorBarColor(score: number): string {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    if (score >= 25) return 'bg-orange-500';
    return 'bg-red-500';
}

/* ===============================
   MAIN COMPONENT
================================ */
export default function WeatherDashboard({ lat, lng, locationName }: WeatherDashboardProps): React.JSX.Element {
    const [weatherData, setWeatherData] = useState<WeatherAPIResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [usingMock, setUsingMock] = useState<boolean>(false);

    const fetchWeather = useCallback(async () => {
        setLoading(true);
        setError(null);
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

        if (!apiKey || apiKey === 'your_api_key_here') {
            // Use mock data
            setWeatherData(generateMockData(lat, lng));
            setUsingMock(true);
            setLoading(false);
            return;
        }

        try {
            // Fetch current weather + 3-hour forecast (free tier, no credit card)
            const [currentRes, forecastRes] = await Promise.all([
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`),
                fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`)
            ]);
            if (!currentRes.ok || !forecastRes.ok) {
                throw new Error(`API error: current=${currentRes.status}, forecast=${forecastRes.status}`);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const currentRaw: any = await currentRes.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const forecastRaw: any = await forecastRes.json();

            // Map 2.5 response to internal types
            const current: CurrentWeather = {
                dt: currentRaw.dt,
                temp: currentRaw.main.temp,
                feels_like: currentRaw.main.feels_like,
                humidity: currentRaw.main.humidity,
                wind_speed: currentRaw.wind.speed,
                uvi: 0, // UV not available in free tier
                weather: currentRaw.weather,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const hourly: HourlyWeather[] = forecastRaw.list.map((item: any) => ({
                dt: item.dt,
                temp: item.main.temp,
                feels_like: item.main.feels_like,
                humidity: item.main.humidity,
                wind_speed: item.wind.speed,
                pop: item.pop ?? 0,
                rain: item.rain ? { '3h': item.rain['3h'] || 0 } : undefined,
                weather: item.weather,
            }));

            const data: WeatherAPIResponse = { current, hourly };
            setWeatherData(data);
            setUsingMock(false);
        } catch (err) {
            console.warn('OpenWeatherMap API failed, using mock data:', err);
            setWeatherData(generateMockData(lat, lng));
            setUsingMock(true);
            setError('Live data unavailable — showing simulated forecast');
        } finally {
            setLoading(false);
        }
    }, [lat, lng]);

    useEffect(() => {
        fetchWeather();
    }, [fetchWeather]);

    // Derived: next 8 forecast entries (3-hour intervals = ~24 hours)
    const next8Hours = useMemo(() => {
        if (!weatherData) return [];
        return weatherData.hourly.slice(0, 8);
    }, [weatherData]);

    // Agriculture advisories
    const advisories = useMemo(() => {
        if (!weatherData) return [];
        return computeAdvisories(weatherData.current, next8Hours);
    }, [weatherData, next8Hours]);

    // Field work score (multi-factor)
    const fieldScoreResult = useMemo((): FieldWorkResult => {
        if (!weatherData) return { overall: 0, factors: [] };
        return calculateFieldWorkScore(weatherData.current, next8Hours);
    }, [weatherData, next8Hours]);

    // Total rainfall accumulation
    const totalRainfall = useMemo(() => {
        return next8Hours.reduce((sum, h) => sum + (h.rain?.['3h'] || 0), 0);
    }, [next8Hours]);

    if (loading) {
        return (
            <div className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
                    <div className="flex gap-3 overflow-hidden">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="w-28 h-32 bg-gray-200 dark:bg-slate-700 rounded-xl flex-shrink-0"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
                        <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!weatherData) return <></>;

    const cur = weatherData.current;

    return (
        <div className="col-span-1 lg:col-span-2 space-y-5">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">🌦️</span>
                        Agriculture Weather Forecast
                    </h3>
                    {locationName && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">📍 {locationName}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {usingMock && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase">
                            Simulated Data
                        </span>
                    )}
                    {error && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400">{error}</span>
                    )}
                    <button
                        onClick={fetchWeather}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300 border-none cursor-pointer transition-all text-sm"
                        title="Refresh weather"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {/* ROW 1: Current Weather + Field Work Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Weather */}
                <div className="md:col-span-2 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10"></div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5"></div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="text-xs uppercase tracking-wider text-white/70 mb-1">Current Weather</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black">{cur.temp.toFixed(0)}°</span>
                                <span className="text-lg opacity-80">C</span>
                            </div>
                            <div className="text-sm text-white/80 mt-1">
                                Feels like {cur.feels_like.toFixed(0)}°C · {cur.weather[0]?.description}
                            </div>
                        </div>
                        <div className="text-6xl drop-shadow-lg">
                            {getWeatherEmoji(cur.weather[0]?.id || 800)}
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-white/20">
                        <div>
                            <div className="text-[10px] uppercase text-white/60 tracking-wider">Humidity</div>
                            <div className="text-lg font-bold">{cur.humidity}%</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase text-white/60 tracking-wider">Wind</div>
                            <div className="text-lg font-bold">{cur.wind_speed.toFixed(1)} <span className="text-xs font-normal">km/h</span></div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase text-white/60 tracking-wider">UV Index</div>
                            <div className="text-lg font-bold">{cur.uvi.toFixed(1)}</div>
                        </div>
                    </div>
                </div>

                {/* Field Work Score — Expanded with Factor Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-4">
                        {/* Gauge */}
                        <div className="relative w-20 h-20 flex-shrink-0">
                            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-slate-700" />
                                <circle cx="50" cy="50" r="42" stroke={scoreColor(fieldScoreResult.overall)} strokeWidth="8" fill="none"
                                    strokeDasharray={`${fieldScoreResult.overall * 2.64} 264`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black" style={{ color: scoreColor(fieldScoreResult.overall) }}>{fieldScoreResult.overall}</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase text-gray-500 dark:text-slate-400 tracking-wider font-bold">Field Work Score</div>
                            <div className="text-lg font-bold" style={{ color: scoreColor(fieldScoreResult.overall) }}>{scoreLabel(fieldScoreResult.overall)}</div>
                            <div className="text-[10px] text-gray-400 dark:text-slate-500">
                                {fieldScoreResult.overall >= 75 ? 'Great day for farming!' : fieldScoreResult.overall >= 50 ? 'Plan tasks carefully' : fieldScoreResult.overall >= 25 ? 'Limited outdoor work' : 'Avoid field operations'}
                            </div>
                        </div>
                    </div>

                    {/* Factor Breakdown */}
                    <div className="space-y-2">
                        {fieldScoreResult.factors.map((factor, idx) => (
                            <div key={idx} className="group">
                                <div className="flex items-center justify-between text-[11px] mb-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span>{factor.icon}</span>
                                        <span className="font-semibold text-gray-700 dark:text-slate-300">{factor.name}</span>
                                        <span className="text-[9px] text-gray-400 dark:text-slate-500">({Math.round(factor.weight * 100)}%)</span>
                                    </div>
                                    <span className="font-bold" style={{ color: scoreColor(factor.score) }}>{factor.score}</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${factorBarColor(factor.score)} transition-all duration-700`}
                                        style={{ width: `${factor.score}%` }}
                                    />
                                </div>
                                <div className="text-[9px] text-gray-400 dark:text-slate-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {factor.detail}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ROW 2: 3-Hour Forecast Timeline */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">⏱️ 3-Hour Forecast</h4>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400 dark:text-slate-500">Total Rainfall:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full ${totalRainfall > 5 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'}`}>
                            {totalRainfall.toFixed(1)} mm
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {next8Hours.map((hour, idx) => (
                        <div
                            key={idx}
                            className="flex-shrink-0 w-[110px] bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-center border border-gray-100 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all cursor-default group"
                        >
                            <div className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase">
                                {formatHour(hour.dt)}
                            </div>
                            <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
                                {getWeatherEmoji(hour.weather[0]?.id || 800)}
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {hour.temp.toFixed(0)}°
                            </div>
                            <div className="mt-2 space-y-1 text-[10px] text-gray-500 dark:text-slate-400">
                                <div className="flex justify-between">
                                    <span>💧</span>
                                    <span className="font-medium">{Math.round(hour.pop * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>💨</span>
                                    <span className="font-medium">{hour.wind_speed.toFixed(0)} km/h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>🌡️</span>
                                    <span className="font-medium">{hour.humidity}%</span>
                                </div>
                            </div>
                            {hour.rain && (
                                <div className="mt-1.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-[9px] font-bold">
                                    🌧 {hour.rain['3h'].toFixed(1)} mm
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ROW 3: Agriculture Smart Advisories */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-slate-700">
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">🌾 Smart Farming Advisories</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {advisories.map((adv, idx) => (
                        <div
                            key={idx}
                            className={`relative border-l-4 rounded-xl p-3.5 ${advisoryColor(adv.level)} transition-all hover:shadow-md`}
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-lg">{adv.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{adv.title}</span>
                                <span className={`ml-auto w-2 h-2 rounded-full ${advisoryBadge(adv.level)} animate-pulse`}></span>
                            </div>
                            <p className="text-[11px] leading-relaxed opacity-80 m-0">{adv.message}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ROW 4: Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    {
                        label: 'Avg Humidity',
                        value: `${Math.round(next8Hours.reduce((s, h) => s + h.humidity, 0) / (next8Hours.length || 1))}%`,
                        icon: '💧',
                        bg: 'from-cyan-500 to-blue-500'
                    },
                    {
                        label: 'Max Wind',
                        value: `${Math.max(...next8Hours.map(h => h.wind_speed)).toFixed(0)} km/h`,
                        icon: '💨',
                        bg: 'from-slate-500 to-gray-600'
                    },
                    {
                        label: 'Rain Hours',
                        value: `${next8Hours.filter(h => h.pop > 0.5).length} / 8`,
                        icon: '🌧️',
                        bg: 'from-blue-500 to-indigo-600'
                    },
                    {
                        label: 'Temp Range',
                        value: `${Math.min(...next8Hours.map(h => h.temp)).toFixed(0)}°–${Math.max(...next8Hours.map(h => h.temp)).toFixed(0)}°`,
                        icon: '🌡️',
                        bg: 'from-orange-500 to-red-500'
                    }
                ].map((stat, idx) => (
                    <div key={idx} className={`bg-gradient-to-br ${stat.bg} rounded-xl p-3.5 text-white shadow-md`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-[9px] uppercase tracking-wider text-white/70 font-semibold">{stat.label}</div>
                                <div className="text-xl font-black mt-1">{stat.value}</div>
                            </div>
                            <span className="text-xl opacity-80">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
