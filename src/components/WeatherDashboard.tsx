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
    rain: number; // mm of precipitation (hourly)
    weather: { id: number; main: string; description: string; icon: string }[];
    uvi: number;
    dew_point?: number;
    et0?: number; // evapotranspiration (mm)
}

interface CurrentWeather {
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    uvi: number;
    pressure: number;
    visibility: number;
    weather: { id: number; main: string; description: string; icon: string }[];
}

interface DailyWeather {
    sunrise: string;
    sunset: string;
    uv_index_max: number;
}

interface WeatherAPIResponse {
    current: CurrentWeather;
    hourly: HourlyWeather[];
    daily?: DailyWeather;
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
    const baseHumidity = 55 + Math.floor(Math.random() * 30);

    const current: CurrentWeather = {
        dt: now,
        temp: baseTemp,
        feels_like: baseTemp + 2,
        humidity: baseHumidity,
        wind_speed: 2 + Math.random() * 8,
        uvi: 4 + Math.random() * 6,
        pressure: 1010 + Math.random() * 15,
        visibility: 8 + Math.random() * 12,
        weather: [{ id: 2, main: 'Clouds', description: 'partly cloudy', icon: '03d' }]
    };

    const hourly: HourlyWeather[] = Array.from({ length: 24 }, (_, i) => {
        const hourTemp = baseTemp + (Math.random() - 0.5) * 6 - (i > 12 ? (i - 12) * 0.4 : 0);
        const rainChance = Math.random();
        const hum = Math.min(100, 50 + Math.floor(Math.random() * 40));
        return {
            dt: now + (i + 1) * 3600, // hourly intervals
            temp: Math.round(hourTemp * 10) / 10,
            feels_like: Math.round((hourTemp + 1.5) * 10) / 10,
            humidity: hum,
            wind_speed: Math.round((1.5 + Math.random() * 10) * 10) / 10,
            pop: Math.round(rainChance * 100) / 100,
            rain: rainChance > 0.6 ? Math.round(Math.random() * 5 * 10) / 10 : 0,
            weather: [
                rainChance > 0.7
                    ? { id: 61, main: 'Rain', description: 'light rain', icon: '10d' }
                    : rainChance > 0.4
                        ? { id: 2, main: 'Clouds', description: 'partly cloudy', icon: '03d' }
                        : { id: 0, main: 'Clear', description: 'clear sky', icon: '01d' }
            ],
            uvi: Math.max(0, 5 + (Math.random() - 0.5) * 8 - (i > 6 ? (i - 6) * 0.5 : 0)),
            dew_point: hourTemp - 5 + Math.random() * 3,
            et0: 0.15 + Math.random() * 0.3,
        };
    });

    return { current, hourly };
}

/* ===============================
   HELPER FUNCTIONS
================================ */
function formatHour(dt: number | string): string {
    // Open-Meteo returns ISO strings; mock data uses unix seconds
    const date = typeof dt === 'string' ? new Date(dt) : new Date(dt * 1000);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// WMO Weather interpretation codes (used by Open-Meteo)
function getWeatherEmoji(wmoCode: number): string {
    if (wmoCode === 0) return '☀️';           // Clear sky
    if (wmoCode <= 3) return '⛅';             // Partly cloudy
    if (wmoCode <= 49) return '🌫️';           // Fog
    if (wmoCode <= 59) return '🌦️';           // Drizzle
    if (wmoCode <= 69) return '🌧️';           // Rain
    if (wmoCode <= 79) return '❄️';            // Snow
    if (wmoCode <= 84) return '🌧️';           // Rain showers
    if (wmoCode <= 86) return '🌨️';           // Snow showers
    if (wmoCode >= 95) return '⛈️';            // Thunderstorm
    return '🌡️';
}

function wmoDescription(code: number): string {
    const d: Record<number, string> = {
        0: 'clear sky', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
        45: 'fog', 48: 'depositing rime fog',
        51: 'light drizzle', 53: 'moderate drizzle', 55: 'dense drizzle',
        61: 'slight rain', 63: 'moderate rain', 65: 'heavy rain',
        71: 'slight snow', 73: 'moderate snow', 75: 'heavy snow',
        80: 'slight rain showers', 81: 'moderate rain showers', 82: 'violent rain showers',
        85: 'slight snow showers', 86: 'heavy snow showers',
        95: 'thunderstorm', 96: 'thunderstorm with slight hail', 99: 'thunderstorm with heavy hail',
    };
    return d[code] || 'unknown';
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
    const totalRain = forecast.reduce((s, h) => s + h.rain, 0);
    const heavyPeriods = forecast.filter(h => h.rain > 5).length;

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
    const totalRain = forecast.reduce((s, h) => s + h.rain, 0);
    const recentHeavyRain = forecast.slice(0, 3).reduce((s, h) => s + h.rain, 0);
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
// Uses real FAO Penman-Monteith ET₀ from Open-Meteo when available
function etScore(forecast: HourlyWeather[]): { score: number; detail: string; etMm: number } {
    // Prefer real FAO ET₀ from API; sum hourly values to get daily total
    const hasRealET = forecast.some(h => h.et0 !== undefined && h.et0 > 0);
    let et0: number;
    if (hasRealET) {
        et0 = forecast.reduce((s, h) => s + (h.et0 || 0), 0);
    } else {
        // Fallback: Hargreaves approximation
        const temps = forecast.map(h => h.temp);
        et0 = calcET0(Math.min(...temps), Math.max(...temps), temps.reduce((s, t) => s + t, 0) / temps.length, 20);
    }
    const totalRain = forecast.reduce((s, h) => s + h.rain, 0);
    const waterDeficit = et0 - totalRain;

    // Score: irrigation urgency (higher deficit = lower score = more urgent)
    let score = 100;
    if (waterDeficit > 5) score -= 40;
    else if (waterDeficit > 3) score -= 25;
    else if (waterDeficit > 1) score -= 10;
    else if (waterDeficit < -5) score -= 15; // waterlogging risk

    score = Math.max(0, Math.min(100, Math.round(score)));
    const src = hasRealET ? 'FAO' : 'est.';
    const detail = `ET₀ ${src} ${et0.toFixed(1)}mm/day, rain ${totalRain.toFixed(1)}mm, deficit ${waterDeficit.toFixed(1)}mm`;
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
    const totalRain = next8.reduce((sum, h) => sum + h.rain, 0);
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

        try {
            // Open-Meteo: free, no API key, hourly data with agriculture-relevant variables
            const params = new URLSearchParams({
                latitude: lat.toString(),
                longitude: lng.toString(),
                current: [
                    'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
                    'weather_code', 'wind_speed_10m', 'uv_index',
                    'pressure_msl'
                ].join(','),
                hourly: [
                    'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
                    'precipitation_probability', 'precipitation', 'weather_code',
                    'wind_speed_10m', 'uv_index', 'dew_point_2m',
                    'et0_fao_evapotranspiration', 'visibility'
                ].join(','),
                daily: 'sunrise,sunset,uv_index_max',
                timezone: 'auto',
                forecast_days: '2',
            });

            const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
            if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const raw: any = await res.json();

            // Map current weather
            const current: CurrentWeather = {
                dt: Math.floor(new Date(raw.current.time).getTime() / 1000),
                temp: raw.current.temperature_2m,
                feels_like: raw.current.apparent_temperature,
                humidity: raw.current.relative_humidity_2m,
                wind_speed: raw.current.wind_speed_10m,
                uvi: raw.current.uv_index ?? 0,
                pressure: raw.current.pressure_msl ?? 1013,
                visibility: (raw.hourly?.visibility?.[0] ?? 10000) / 1000,
                weather: [{
                    id: raw.current.weather_code,
                    main: wmoDescription(raw.current.weather_code),
                    description: wmoDescription(raw.current.weather_code),
                    icon: ''
                }],
            };

            // Parse daily data
            const daily: DailyWeather | undefined = raw.daily ? {
                sunrise: raw.daily.sunrise[0],
                sunset: raw.daily.sunset[0],
                uv_index_max: raw.daily.uv_index_max?.[0] ?? 0,
            } : undefined;

            // Map hourly forecast (parallel arrays → array of objects)
            const times: string[] = raw.hourly.time;
            const nowIdx = times.findIndex((t: string) => new Date(t) > new Date());
            const startIdx = Math.max(0, nowIdx);

            const hourly: HourlyWeather[] = times.slice(startIdx, startIdx + 24).map((_: string, i: number) => {
                const idx = startIdx + i;
                return {
                    dt: raw.hourly.time[idx], // ISO string
                    temp: raw.hourly.temperature_2m[idx],
                    feels_like: raw.hourly.apparent_temperature[idx],
                    humidity: raw.hourly.relative_humidity_2m[idx],
                    wind_speed: raw.hourly.wind_speed_10m[idx],
                    pop: (raw.hourly.precipitation_probability[idx] ?? 0) / 100,
                    rain: raw.hourly.precipitation[idx] ?? 0,
                    weather: [{
                        id: raw.hourly.weather_code[idx],
                        main: wmoDescription(raw.hourly.weather_code[idx]),
                        description: wmoDescription(raw.hourly.weather_code[idx]),
                        icon: ''
                    }],
                    uvi: raw.hourly.uv_index[idx] ?? 0,
                    dew_point: raw.hourly.dew_point_2m?.[idx],
                    et0: raw.hourly.et0_fao_evapotranspiration?.[idx],
                };
            });

            setWeatherData({ current, hourly, daily });
            setUsingMock(false);
        } catch (err) {
            console.warn('Open-Meteo API failed, using mock data:', err);
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

    // Derived: next 8 hourly forecast entries
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
        return next8Hours.reduce((sum, h) => sum + h.rain, 0);
    }, [next8Hours]);

    /* ─── Sun position helper ─── */
    const sunProgress = useMemo(() => {
        if (!weatherData?.daily) return 0.5;
        const now = Date.now();
        const rise = new Date(weatherData.daily.sunrise).getTime();
        const set = new Date(weatherData.daily.sunset).getTime();
        if (now < rise) return 0;
        if (now > set) return 1;
        return (now - rise) / (set - rise);
    }, [weatherData]);

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    /* ─── LOADING SKELETON ─── */
    if (loading) {
        return (
            <div className="space-y-5">
                {/* Hero skeleton */}
                <div className="bento-card p-6 animate-pulse">
                    <div className="flex justify-between items-start">
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                            <div className="h-14 bg-gray-200 dark:bg-slate-700 rounded w-40" />
                            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-56" />
                        </div>
                        <div className="w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-full" />
                    </div>
                </div>
                {/* Cards skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bento-card p-4 h-36 animate-pulse">
                            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-3" />
                            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-16" />
                        </div>
                    ))}
                </div>
                {/* Hourly skeleton */}
                <div className="bento-card p-5 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-40 mb-4" />
                    <div className="flex gap-3 overflow-hidden">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="w-24 h-28 bg-gray-200 dark:bg-slate-700 rounded-xl flex-shrink-0" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!weatherData) return <></>;

    const cur = weatherData.current;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    /* ─── UV level helper ─── */
    const uvLabel = (uv: number) => {
        if (uv <= 2) return { text: 'Low', color: '#22c55e' };
        if (uv <= 5) return { text: 'Moderate', color: '#f59e0b' };
        if (uv <= 7) return { text: 'High', color: '#f97316' };
        if (uv <= 10) return { text: 'Very High', color: '#ef4444' };
        return { text: 'Extreme', color: '#7c3aed' };
    };
    const uvInfo = uvLabel(cur.uvi);

    /* ─── Pressure category ─── */
    const pressureLabel = (p: number) => {
        if (p < 1000) return 'Low';
        if (p < 1020) return 'Normal';
        return 'High';
    };

    return (
        <div className="space-y-5">
            {/* ─── HEADER ROW ─── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 weather-fade-in">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 m-0">
                        <span className="text-2xl">🌦️</span>
                        Agriculture Weather
                    </h3>
                    {locationName && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 m-0">📍 {locationName}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {usingMock && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase">
                            Simulated
                        </span>
                    )}
                    {error && <span className="text-[10px] text-amber-600 dark:text-amber-400">{error}</span>}
                    <button
                        onClick={fetchWeather}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300 border-none cursor-pointer transition-all text-sm"
                        title="Refresh weather"
                    >🔄</button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                SECTION 1: HERO — Current Weather
            ═══════════════════════════════════════════ */}
            <div className="bento-card bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 p-6 sm:p-8 text-white relative overflow-hidden weather-fade-in weather-fade-in-1">
                {/* Decorative */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
                <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/5" />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2" />

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="text-xs uppercase tracking-widest text-white/60 mb-1">{dateStr}</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-7xl sm:text-8xl font-black tracking-tighter">{cur.temp.toFixed(0)}°</span>
                            </div>
                            <div className="text-sm text-white/80 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span>Feels like {cur.feels_like.toFixed(0)}°C</span>
                                <span className="w-1 h-1 rounded-full bg-white/40" />
                                <span className="capitalize">{cur.weather[0]?.description}</span>
                                <span className="w-1 h-1 rounded-full bg-white/40" />
                                <span>{timeStr}</span>
                            </div>
                        </div>
                        <div className="text-7xl sm:text-8xl weather-float drop-shadow-2xl">
                            {getWeatherEmoji(cur.weather[0]?.id || 800)}
                        </div>
                    </div>

                    {/* Mini stats row */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6 pt-5 border-t border-white/15">
                        {[
                            { label: 'Humidity', value: `${cur.humidity}%`, icon: '💧' },
                            { label: 'Wind', value: `${cur.wind_speed.toFixed(1)} km/h`, icon: '💨' },
                            { label: 'UV Index', value: cur.uvi.toFixed(1), icon: '☀️' },
                            { label: 'Pressure', value: `${cur.pressure.toFixed(0)} hPa`, icon: '🌡️' },
                            { label: 'Visibility', value: `${cur.visibility.toFixed(0)} km`, icon: '👁️' },
                            { label: 'Dew Point', value: `${calcDewPoint(cur.temp, cur.humidity).toFixed(0)}°C`, icon: '🌫️' },
                        ].map((s, i) => (
                            <div key={i}>
                                <div className="text-[10px] uppercase text-white/50 tracking-wider">{s.icon} {s.label}</div>
                                <div className="text-base sm:text-lg font-bold mt-0.5">{s.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                SECTION 2: WEATHER DETAIL BENTO GRID
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Humidity Card */}
                <div className="bento-card p-4 weather-fade-in weather-fade-in-2">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold mb-2">💧 Humidity</div>
                    <div className="flex items-center justify-center mb-2">
                        <svg width="80" height="48" viewBox="0 0 80 48">
                            <path d="M 8 44 A 32 32 0 0 1 72 44" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-gray-200 dark:text-slate-700" />
                            <path d="M 8 44 A 32 32 0 0 1 72 44" fill="none" stroke="url(#humGrad)" strokeWidth="6" strokeLinecap="round"
                                strokeDasharray={`${cur.humidity * 1.005} 100.5`} />
                            <defs>
                                <linearGradient id="humGrad" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#38bdf8" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">{cur.humidity}%</span>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                            {cur.humidity > 80 ? 'High moisture' : cur.humidity > 50 ? 'Comfortable' : 'Dry air'}
                        </div>
                    </div>
                </div>

                {/* Wind Card */}
                <div className="bento-card p-4 weather-fade-in weather-fade-in-3">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold mb-2">💨 Wind</div>
                    <div className="flex items-center justify-center mb-2">
                        <svg width="60" height="60" viewBox="0 0 60 60">
                            <circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-200 dark:text-slate-700" />
                            {/* Cardinal directions */}
                            <text x="30" y="10" textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-400 dark:text-slate-500 font-bold">N</text>
                            <text x="54" y="33" textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-400 dark:text-slate-500">E</text>
                            <text x="30" y="56" textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-400 dark:text-slate-500">S</text>
                            <text x="6" y="33" textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-400 dark:text-slate-500">W</text>
                            {/* Wind arrow */}
                            <circle cx="30" cy="30" r="4" fill="#38bdf8" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">{cur.wind_speed.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400 ml-1">km/h</span>
                    </div>
                </div>

                {/* UV Index Card */}
                <div className="bento-card p-4 weather-fade-in weather-fade-in-4">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold mb-2">☀️ UV Index</div>
                    <div className="text-center mb-2">
                        <span className="text-3xl font-black" style={{ color: uvInfo.color }}>{cur.uvi.toFixed(1)}</span>
                    </div>
                    {/* UV gradient bar */}
                    <div className="relative h-2 rounded-full overflow-hidden bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500 to-purple-600">
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 shadow-md transition-all duration-500"
                            style={{ left: `${Math.min(cur.uvi / 11 * 100, 100)}%`, borderColor: uvInfo.color }}
                        />
                    </div>
                    <div className="text-[10px] text-center mt-1.5 font-semibold" style={{ color: uvInfo.color }}>{uvInfo.text}</div>
                </div>

                {/* Pressure Card */}
                <div className="bento-card p-4 weather-fade-in weather-fade-in-5">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold mb-2">🌡️ Pressure</div>
                    <div className="flex items-center justify-center mb-2">
                        <svg width="80" height="48" viewBox="0 0 80 48">
                            <path d="M 8 44 A 32 32 0 0 1 72 44" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-gray-200 dark:text-slate-700" />
                            <path d="M 8 44 A 32 32 0 0 1 72 44" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round"
                                strokeDasharray={`${Math.min(((cur.pressure - 980) / 50) * 100.5, 100.5)} 100.5`} />
                        </svg>
                    </div>
                    <div className="text-center">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">{cur.pressure.toFixed(0)}</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400 ml-1">hPa</span>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{pressureLabel(cur.pressure)}</div>
                    </div>
                </div>

                {/* Dew Point Card */}
                <div className="bento-card p-4 weather-fade-in weather-fade-in-6">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold mb-2">🌫️ Dew Point</div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{calcDewPoint(cur.temp, cur.humidity).toFixed(0)}°</span>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                            Spread: {(cur.temp - calcDewPoint(cur.temp, cur.humidity)).toFixed(0)}°C
                        </div>
                    </div>
                </div>

                {/* Feels Like Card */}
                <div className="bento-card p-4 weather-fade-in weather-fade-in-7">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold mb-2">🤒 Feels Like</div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{cur.feels_like.toFixed(0)}°</span>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                            {cur.feels_like > cur.temp ? `${(cur.feels_like - cur.temp).toFixed(0)}° warmer` : cur.feels_like < cur.temp ? `${(cur.temp - cur.feels_like).toFixed(0)}° cooler` : 'Same as actual'}
                        </div>
                    </div>
                </div>

                {/* Visibility Card */}
                <div className="bento-card p-4 weather-fade-in weather-fade-in-8">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold mb-2">👁️ Visibility</div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{cur.visibility.toFixed(0)}</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">km</span>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                            {cur.visibility > 10 ? 'Clear' : cur.visibility > 4 ? 'Moderate' : 'Poor'}
                        </div>
                    </div>
                </div>

                {/* Precipitation Card */}
                <div className="bento-card p-4 weather-fade-in weather-fade-in-8">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold mb-2">🌧️ Precipitation</div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{totalRainfall.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">mm (8h total)</span>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                            {next8Hours.filter(h => h.pop > 0.5).length} of 8 hrs rainy
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                SECTION 3: HOURLY FORECAST CAROUSEL
            ═══════════════════════════════════════════ */}
            <div className="bento-card p-5 weather-fade-in weather-fade-in-2">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white m-0">⏱️ Hourly Forecast</h4>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${totalRainfall > 5 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                        {totalRainfall.toFixed(1)} mm total
                    </span>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scroll-snap-x scroll-thin-x">
                    {next8Hours.map((hour, idx) => (
                        <div
                            key={idx}
                            className="flex-shrink-0 w-[105px] bg-gray-50 dark:bg-slate-700/40 rounded-xl p-3 text-center border border-gray-100 dark:border-slate-600/50 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default group"
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
                                <div className="flex justify-between"><span>💧</span><span className="font-medium">{Math.round(hour.pop * 100)}%</span></div>
                                <div className="flex justify-between"><span>💨</span><span className="font-medium">{hour.wind_speed.toFixed(0)}</span></div>
                            </div>
                            {hour.rain > 0 && (
                                <div className="mt-1.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold">
                                    🌧 {hour.rain.toFixed(1)}mm
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                SECTION 4: SUN & MOON
            ═══════════════════════════════════════════ */}
            {weatherData.daily && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 weather-fade-in weather-fade-in-3">
                    {/* Sun Card */}
                    <div className="bento-card p-5">
                        <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold mb-3">☀️ Sunrise & Sunset</div>
                        <div className="flex items-center justify-center mb-3">
                            <svg width="200" height="90" viewBox="0 0 200 90">
                                {/* Horizon line */}
                                <line x1="10" y1="80" x2="190" y2="80" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-slate-700" />
                                {/* Arc path */}
                                <path d="M 20 80 Q 100 -10 180 80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-gray-300 dark:text-slate-600" />
                                {/* Sun progress arc */}
                                <path d="M 20 80 Q 100 -10 180 80" fill="none" stroke="url(#sunArcGrad)" strokeWidth="3" strokeLinecap="round"
                                    strokeDasharray={`${sunProgress * 224} 224`} />
                                {/* Sun dot */}
                                {sunProgress > 0 && sunProgress < 1 && (
                                    <circle
                                        cx={20 + sunProgress * 160}
                                        cy={80 - Math.sin(sunProgress * Math.PI) * 90}
                                        r="8" fill="#fbbf24" className="sun-glow"
                                    />
                                )}
                                <defs>
                                    <linearGradient id="sunArcGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#fb923c" />
                                        <stop offset="50%" stopColor="#fbbf24" />
                                        <stop offset="100%" stopColor="#fb923c" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div className="flex justify-between text-sm">
                            <div>
                                <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase">Sunrise</div>
                                <div className="font-bold text-gray-900 dark:text-white">{formatTime(weatherData.daily.sunrise)}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase">UV Max</div>
                                <div className="font-bold" style={{ color: uvLabel(weatherData.daily.uv_index_max).color }}>
                                    {weatherData.daily.uv_index_max.toFixed(1)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase">Sunset</div>
                                <div className="font-bold text-gray-900 dark:text-white">{formatTime(weatherData.daily.sunset)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Moon Card */}
                    <div className="bento-card p-5">
                        <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400 font-semibold mb-3">🌙 Moon Phase</div>
                        <div className="flex flex-col items-center justify-center flex-1 py-4">
                            {/* Moon phase calculation (simplified — based on synodic month) */}
                            {(() => {
                                const daysSinceNew = ((Date.now() / 86400000) - 10.5) % 29.53;
                                const phase = daysSinceNew / 29.53;
                                const emoji = phase < 0.125 ? '🌑' : phase < 0.25 ? '🌒' : phase < 0.375 ? '🌓' : phase < 0.5 ? '🌔' : phase < 0.625 ? '🌕' : phase < 0.75 ? '🌖' : phase < 0.875 ? '🌗' : '🌘';
                                const name = phase < 0.125 ? 'New Moon' : phase < 0.25 ? 'Waxing Crescent' : phase < 0.375 ? 'First Quarter' : phase < 0.5 ? 'Waxing Gibbous' : phase < 0.625 ? 'Full Moon' : phase < 0.75 ? 'Waning Gibbous' : phase < 0.875 ? 'Last Quarter' : 'Waning Crescent';
                                const illumination = Math.round(phase < 0.5 ? phase * 2 * 100 : (1 - (phase - 0.5) * 2) * 100);
                                return (
                                    <>
                                        <span className="text-5xl mb-2">{emoji}</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{name}</span>
                                        <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{illumination}% illuminated</span>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════
                SECTION 5: FIELD WORK SCORE
            ═══════════════════════════════════════════ */}
            <div className="bento-card p-5 weather-fade-in weather-fade-in-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    {/* Gauge */}
                    <div className="flex items-center gap-4">
                        <div className="relative w-24 h-24 flex-shrink-0">
                            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="7" fill="none" className="text-gray-200 dark:text-slate-700" />
                                <circle cx="50" cy="50" r="42" stroke={scoreColor(fieldScoreResult.overall)} strokeWidth="7" fill="none"
                                    strokeDasharray={`${fieldScoreResult.overall * 2.64} 264`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dasharray 1s ease' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black" style={{ color: scoreColor(fieldScoreResult.overall) }}>{fieldScoreResult.overall}</span>
                                <span className="text-[8px] uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider">Score</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs uppercase text-gray-500 dark:text-slate-400 tracking-wider font-bold">🌾 Field Work Score</div>
                            <div className="text-xl font-bold mt-0.5" style={{ color: scoreColor(fieldScoreResult.overall) }}>{scoreLabel(fieldScoreResult.overall)}</div>
                            <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                                {fieldScoreResult.overall >= 75 ? 'Great day for farming!' : fieldScoreResult.overall >= 50 ? 'Plan tasks carefully' : fieldScoreResult.overall >= 25 ? 'Limited outdoor work' : 'Avoid field operations'}
                            </div>
                        </div>
                    </div>

                    {/* Factor Breakdown */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {fieldScoreResult.factors.map((factor, idx) => (
                            <div key={idx} className="group">
                                <div className="flex items-center justify-between text-[11px] mb-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span>{factor.icon}</span>
                                        <span className="font-semibold text-gray-700 dark:text-slate-300">{factor.name}</span>
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

            {/* ═══════════════════════════════════════════
                SECTION 6: SMART FARMING ADVISORIES
            ═══════════════════════════════════════════ */}
            <div className="weather-fade-in weather-fade-in-5">
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3 ml-1">🌾 Smart Farming Advisories</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {advisories.map((adv, idx) => (
                        <div
                            key={idx}
                            className={`bento-card relative border-l-4 p-4 ${advisoryColor(adv.level)} transition-all hover:shadow-lg`}
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-lg">{adv.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{adv.title}</span>
                                <span className={`ml-auto w-2 h-2 rounded-full ${advisoryBadge(adv.level)} animate-pulse`} />
                            </div>
                            <p className="text-[11px] leading-relaxed opacity-80 m-0">{adv.message}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                SECTION 7: QUICK STATS
            ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 weather-fade-in weather-fade-in-6">
                {[
                    { label: 'Avg Humidity', value: `${Math.round(next8Hours.reduce((s, h) => s + h.humidity, 0) / (next8Hours.length || 1))}%`, icon: '💧', bg: 'from-cyan-500 to-blue-500' },
                    { label: 'Max Wind', value: `${Math.max(...next8Hours.map(h => h.wind_speed)).toFixed(0)} km/h`, icon: '💨', bg: 'from-slate-500 to-gray-600' },
                    { label: 'Rain Hours', value: `${next8Hours.filter(h => h.pop > 0.5).length} / 8`, icon: '🌧️', bg: 'from-blue-500 to-indigo-600' },
                    { label: 'Temp Range', value: `${Math.min(...next8Hours.map(h => h.temp)).toFixed(0)}°–${Math.max(...next8Hours.map(h => h.temp)).toFixed(0)}°`, icon: '🌡️', bg: 'from-orange-500 to-red-500' },
                ].map((stat, idx) => (
                    <div key={idx} className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-4 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
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
