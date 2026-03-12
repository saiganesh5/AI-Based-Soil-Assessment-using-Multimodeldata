import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import WeatherDashboard from '../components/WeatherDashboard';

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

/* ===============================
   WEATHER PAGE
================================ */
export default function Weather(): React.JSX.Element {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [locationName, setLocationName] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
    const [searching, setSearching] = useState<boolean>(false);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

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
        // Shorten display name (take first 2-3 parts)
        const parts = result.display_name.split(', ');
        setLocationName(parts.slice(0, 3).join(', '));
        setSearchQuery(parts.slice(0, 2).join(', '));
        setSuggestions([]);
        setShowSuggestions(false);
    }, []);

    // "Use My Location" via browser geolocation
    const handleUseMyLocation = useCallback(() => {
        if (!navigator.geolocation) return;
        setSearching(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setCoords({ lat, lng });
                // Reverse geocode for display name
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
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors">
            {/* NAVBAR */}
            <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-bold">
                    <span className="text-xl">🌦️</span>
                    <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">Agriculture Weather Forecast</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <button
                        className="text-gray-600 dark:text-slate-300 font-medium hidden md:inline hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-transparent border-none cursor-pointer"
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Soil Dashboard
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
                    <button className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleLogout}>🚪 Logout</button>
                </div>
            </div>

            {/* LOCATION SEARCH BAR */}
            <div className="container py-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-slate-700 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        📍 Search Your Farm Location
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Input with Suggestions */}
                        <div className="relative flex-1" ref={searchBoxRef}>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="locationSearch"
                                    placeholder="Search city, district, or village... (e.g. Hyderabad, Nashik)"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-base">
                                    🔍
                                </span>
                                {searching && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-slate-500 animate-pulse">
                                        Searching...
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

                        {/* Use My Location Button */}
                        <button
                            className="px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold border-none cursor-pointer transition-colors shadow-md whitespace-nowrap flex items-center gap-2"
                            onClick={handleUseMyLocation}
                            disabled={searching}
                        >
                            📍 Use My Location
                        </button>
                    </div>

                    {/* Selected Location Info */}
                    {locationName && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                            <span className="text-gray-500 dark:text-slate-400">Showing weather for:</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{locationName}</span>
                            {coords && (
                                <span className="text-[10px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                    {coords.lat.toFixed(2)}°N, {coords.lng.toFixed(2)}°E
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* LOCATION MAP */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden mb-6">
                    <MapContainer
                        center={[coords?.lat ?? 20.5937, coords?.lng ?? 78.9629]}
                        zoom={coords ? 10 : 5}
                        style={{ height: '260px', width: '100%' }}
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

                {/* WEATHER DASHBOARD */}
                <div className="grid grid-cols-1 lg:grid-cols-2">
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
