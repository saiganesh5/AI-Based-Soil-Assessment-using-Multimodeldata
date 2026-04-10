import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import WeatherDashboard from '../components/WeatherDashboard';
import { useTour, type TourStep } from '../context/TourContext';

// Fix Leaflet default icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Auto-pans map when coordinates change
function MapUpdater({ lat, lng }: { lat: number; lng: number }): null {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], 10, { duration: 1.2 });
    }, [lat, lng, map]);
    return null;
}

/* ===============================
   TYPES
================================ */
interface LocationResult {
    lat: number;
    lng: number;
    display_name: string;
}

/* Quick-city shortcuts */
const QUICK_CITIES = [
    { name: 'Delhi', lat: 28.6139, lng: 77.209 },
    { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
    { name: 'Phagwara', lat: 31.224, lng: 75.7708 },
];

/* ===============================
   WEATHER PAGE
================================ */
export default function Weather(): React.JSX.Element {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { isPageTourDone, startPageTour, resetPageTour } = useTour();

    const weatherTourSteps: TourStep[] = useMemo(() => [
        {
            target: '#weather-search',
            title: 'Search Your Location 🔍',
            description: 'Type a city, district, or village name to look up weather data. Or click "My Location" to auto-detect.',
            position: 'bottom',
        },
        {
            target: '#quick-cities',
            title: 'Quick City Selection ⚡',
            description: 'Click any city pill for instant weather data — great shortcuts for major Indian cities.',
            position: 'bottom',
        },
        {
            target: '#map-toggle',
            title: 'Map View 🗺️',
            description: 'Toggle the interactive map to visually pick your location.',
            position: 'bottom',
        },
        {
            target: '#weather-dashboard',
            title: 'Weather Insights 🌤️',
            description: 'View detailed weather data including temperature, humidity, wind, rainfall forecast, and agricultural advisory for your location.',
            position: 'top',
        },
    ], []);

    useEffect(() => {
        if (!isPageTourDone('weather')) {
            const timer = setTimeout(() => {
                startPageTour('weather', weatherTourSteps);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isPageTourDone, startPageTour, weatherTourSteps]);

    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [locationName, setLocationName] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
    const [searching, setSearching] = useState<boolean>(false);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [showMap, setShowMap] = useState<boolean>(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchBoxRef = useRef<HTMLDivElement>(null);

    // Close suggestions on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced geocode search via Nominatim (free, no API key)
    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setSearching(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value.trim())}&countrycodes=in&limit=6&addressdetails=1`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data: any[] = await res.json();
                const results: LocationResult[] = data.map(item => ({
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                    display_name: item.display_name,
                }));
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } catch (err) {
                console.error('Geocoding failed:', err);
                setSuggestions([]);
            } finally {
                setSearching(false);
            }
        }, 400);
    }, []);

    // Select a suggestion
    const handleSelectLocation = useCallback((result: LocationResult) => {
        setCoords({ lat: result.lat, lng: result.lng });
        const parts = result.display_name.split(', ');
        setLocationName(parts.slice(0, 3).join(', '));
        setSearchQuery(parts.slice(0, 2).join(', '));
        setSuggestions([]);
        setShowSuggestions(false);
    }, []);

    // Quick city select
    const handleQuickCity = useCallback((city: typeof QUICK_CITIES[0]) => {
        setCoords({ lat: city.lat, lng: city.lng });
        setLocationName(city.name);
        setSearchQuery(city.name);
    }, []);

    // "Use My Location" via browser geolocation
    const handleUseMyLocation = useCallback(() => {
        if (!navigator.geolocation) return;
        setSearching(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setCoords({ lat, lng });
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, { headers: { 'Accept-Language': 'en' } })
                    .then(r => r.json())
                    .then((data: { display_name?: string; address?: { city?: string; state_district?: string; county?: string; state?: string } }) => {
                        const addr = data.address;
                        const name = addr
                            ? `${addr.city || addr.state_district || addr.county || ''}, ${addr.state || ''}`.replace(/^, /, '')
                            : 'Your Location';
                        setLocationName(name);
                        setSearchQuery(name);
                    }).catch(() => {
                        setLocationName('Your Location');
                        setSearchQuery('Your Location');
                    }).finally(() => setSearching(false));
            },
            () => {
                setSearching(false);
                alert('Location access denied. Please search manually.');
            },
            { enableHighAccuracy: false, timeout: 8000 }
        );
    }, []);

    const handleLogout = useCallback(async () => {
        try { await logout(); navigate('/login'); }
        catch (err) { console.error('Logout failed:', err); }
    }, [logout, navigate]);

    return (
        <div className="weather-bg transition-colors">
            {/* ─── STICKY NAVBAR ─── */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-slate-700/60 px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-2 text-lg font-bold">
                        <span className="text-xl">🌦️</span>
                        <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent hidden sm:inline">
                            Agriculture Weather
                        </span>
                    </div>

                    {/* Quick City Pills */}
                    <div id="quick-cities" className="hidden lg:flex items-center gap-1.5 overflow-x-auto scroll-thin-x">
                        {QUICK_CITIES.map((city) => (
                            <button
                                key={city.name}
                                onClick={() => handleQuickCity(city)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border-none cursor-pointer transition-all whitespace-nowrap
                                    ${locationName === city.name
                                        ? 'bg-sky-500 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400'
                                    }`}
                            >
                                {city.name}
                            </button>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 text-sm">
                        <button
                            className="text-gray-600 dark:text-slate-300 font-medium hidden md:inline hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-transparent border-none cursor-pointer"
                            onClick={() => navigate('/dashboard')}
                        >
                            ← Dashboard
                        </button>
                        <button
                            className="text-gray-600 dark:text-slate-300 font-medium hidden md:inline hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors bg-transparent border-none cursor-pointer"
                            onClick={() => navigate('/predict-disease')}
                        >
                            🌿 Disease
                        </button>
                        <button
                            className="p-2 rounded-full text-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all cursor-pointer border-none bg-transparent"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        <button className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleLogout}>🚪</button>
                        <button
                            className="p-2 rounded-full text-sm hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-all cursor-pointer border-none bg-transparent text-sky-600 dark:text-sky-400 font-bold"
                            onClick={() => { resetPageTour('weather'); setTimeout(() => startPageTour('weather', weatherTourSteps), 100); }}
                            title="Take a guided tour"
                            aria-label="Restart tour"
                        >
                            ?
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── MAIN CONTENT ─── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

                {/* ─── SEARCH BAR ─── */}
                <div id="weather-search" className="bento-card p-4 sm:p-5 mb-5 weather-fade-in">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Input with Suggestions */}
                        <div className="relative flex-1" ref={searchBoxRef}>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="locationSearch"
                                    placeholder="Search city, district, or village…"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/60 text-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-base">
                                    🔍
                                </span>
                                {searching && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-slate-500 animate-pulse">
                                        Searching…
                                    </span>
                                )}
                            </div>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600 overflow-hidden z-50 max-h-64 overflow-y-auto">
                                    {suggestions.map((result, idx) => {
                                        const parts = result.display_name.split(', ');
                                        const primary = parts.slice(0, 2).join(', ');
                                        const secondary = parts.slice(2, 4).join(', ');
                                        return (
                                            <button
                                                key={idx}
                                                className="w-full text-left px-4 py-3 hover:bg-sky-50 dark:hover:bg-sky-900/20 border-b border-gray-100 dark:border-slate-700 last:border-0 cursor-pointer bg-transparent border-none transition-colors"
                                                onClick={() => handleSelectLocation(result)}
                                            >
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{primary}</div>
                                                <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 truncate">{secondary}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold border-none cursor-pointer transition-all shadow-md whitespace-nowrap flex items-center gap-2 hover:-translate-y-0.5"
                                onClick={handleUseMyLocation}
                                disabled={searching}
                            >
                                📍 My Location
                            </button>
                            <button
                                id="map-toggle"
                                className={`px-3 py-3 rounded-xl text-sm font-medium border-none cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5
                                    ${showMap
                                        ? 'bg-indigo-500 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                                    }`}
                                onClick={() => setShowMap(!showMap)}
                            >
                                🗺️ {showMap ? 'Hide Map' : 'Map'}
                            </button>
                        </div>
                    </div>

                    {/* Selected Location Info */}
                    {locationName && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                            <span className="text-gray-400 dark:text-slate-500">📍</span>
                            <span className="font-semibold text-sky-600 dark:text-sky-400">{locationName}</span>
                            {coords && (
                                <span className="text-[10px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                    {coords.lat.toFixed(2)}°N, {coords.lng.toFixed(2)}°E
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* ─── MAP (toggleable) ─── */}
                {showMap && (
                    <div className="bento-card overflow-hidden mb-5 weather-fade-in" style={{ height: '240px' }}>
                        <MapContainer
                            center={[coords?.lat ?? 20.5937, coords?.lng ?? 78.9629]}
                            zoom={coords ? 10 : 5}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                            zoomControl={true}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                            />
                            {coords && (
                                <>
                                    <MapUpdater lat={coords.lat} lng={coords.lng} />
                                    <Marker position={[coords.lat, coords.lng]}>
                                        <Popup>
                                            <strong>{locationName || 'Selected Location'}</strong>
                                            <br />
                                            {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                                        </Popup>
                                    </Marker>
                                </>
                            )}
                        </MapContainer>
                    </div>
                )}

                {/* ─── WEATHER DASHBOARD ─── */}
                <div id="weather-dashboard">
                <WeatherDashboard
                    lat={coords?.lat ?? 20.5937}
                    lng={coords?.lng ?? 78.9629}
                    locationName={locationName || undefined}
                />
                </div>
            </div>
        </div>
    );
}
