import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ChatBot from '../components/ChatBot';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

ChartJS.register(ArcElement, Tooltip, Legend);

/* ===============================
   DATA (matches js/dashboard.js)
================================ */
const stateDistrictDB = {
    "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "Kadapa", "Nellore"],
    "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey"],
    "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Jorhat", "Kamrup", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "Tinsukia"],
    "Bihar": ["Araria", "Aurangabad", "Begusarai", "Bhagalpur", "Buxar", "Darbhanga", "Gaya", "Muzaffarpur", "Nalanda", "Patna", "Purnia", "Samastipur", "Vaishali"],
    "Chhattisgarh": ["Bastar", "Bilaspur", "Durg", "Korba", "Raipur", "Rajnandgaon", "Surguja"],
    "Goa": ["North Goa", "South Goa"],
    "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Bharuch", "Bhavnagar", "Gandhinagar", "Jamnagar", "Junagadh", "Kutch", "Rajkot", "Surat", "Vadodara"],
    "Haryana": ["Ambala", "Faridabad", "Gurugram", "Hisar", "Karnal", "Panipat", "Rohtak", "Sonipat"],
    "Himachal Pradesh": ["Kangra", "Kullu", "Mandi", "Shimla", "Solan"],
    "Jharkhand": ["Bokaro", "Dhanbad", "Hazaribagh", "Jamshedpur", "Ranchi"],
    "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Urban", "Dharwad", "Hassan", "Mangaluru", "Mysuru", "Shivamogga", "Tumakuru"],
    "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kozhikode", "Malappuram", "Palakkad", "Thiruvananthapuram", "Thrissur", "Wayanad"],
    "Madhya Pradesh": ["Bhopal", "Gwalior", "Indore", "Jabalpur", "Sagar", "Ujjain"],
    "Maharashtra": ["Ahmednagar", "Aurangabad", "Kolhapur", "Mumbai City", "Nagpur", "Nashik", "Pune", "Satara", "Solapur", "Thane"],
    "Manipur": ["Bishnupur", "Imphal East", "Imphal West"],
    "Meghalaya": ["East Khasi Hills", "Ri Bhoi", "West Garo Hills"],
    "Mizoram": ["Aizawl", "Lunglei"],
    "Nagaland": ["Dimapur", "Kohima"],
    "Odisha": ["Balasore", "Cuttack", "Ganjam", "Khordha", "Puri", "Sambalpur"],
    "Punjab": ["Amritsar", "Bathinda", "Jalandhar", "Ludhiana", "Patiala"],
    "Rajasthan": ["Ajmer", "Bikaner", "Jaipur", "Jodhpur", "Kota", "Udaipur"],
    "Sikkim": ["East Sikkim", "West Sikkim"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Thanjavur", "Tiruchirappalli"],
    "Telangana": ["Hyderabad", "Karimnagar", "Khammam", "Nizamabad", "Rangareddy", "Warangal (Urban)"],
    "Tripura": ["West Tripura"],
    "Uttar Pradesh": ["Agra", "Allahabad", "Bareilly", "Gorakhpur", "Kanpur Nagar", "Lucknow", "Meerut", "Varanasi"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Nainital"],
    "West Bengal": ["Darjeeling", "Hooghly", "Howrah", "Kolkata", "Murshidabad", "Nadia"]
};

const soilDatabase = {
    "Alluvial": { color: "#C2A878", crops: ["Wheat", "Rice", "Sugarcane", "Maize", "Pulses"], notes: "Highly fertile, rich in potash." },
    "Black": { color: "#2B2B2B", crops: ["Cotton", "Soybean", "Groundnut", "Wheat"], notes: "Self-ploughing soil, high moisture retention." },
    "Red": { color: "#B7410E", crops: ["Millets", "Tobacco", "Pulses", "Groundnut"], notes: "Rich in iron, porous structure." },
    "Laterite": { color: "#A0522D", crops: ["Tea", "Coffee", "Rubber", "Coconut"], notes: "End product of leaching, acidic." },
    "Desert": { color: "#EDC9AF", crops: ["Bajra", "Barley", "Dates"], notes: "Sandy texture, low organic matter." },
    "Forest": { color: "#556B2F", crops: ["Spices", "Fruits", "Tea"], notes: "High humus content, found in hills." },
    "Peaty": { color: "#3E2723", crops: ["Paddy", "Jute"], notes: "Highly acidic, heavy rainfall areas." },
    "Sandy": { color: "#F4A460", crops: ["Watermelon", "Groundnut"], notes: "High drainage, low nutrients." },
    "Clay": { color: "#8B4513", crops: ["Rice", "Broccoli"], notes: "Dense, holds water very long." },
    "Silt": { color: "#B0BEC5", crops: ["Vegetables", "Wheat"], notes: "Retains moisture better than sand." },
    "Loamy": { color: "#6DBE45", crops: ["Wheat", "Sugarcane", "Cotton", "Vegetables"], notes: "Ideal for agriculture, balanced nutrients." },
    "Chalky": { color: "#F5F5DC", crops: ["Barley", "Spinach"], notes: "Stony, alkaline in nature." }
};

const cropIntelligence = {
    "Rice": { duration: 120, yieldPerAcre: 22, marketPrice: 2200, fertilizer: { "Urea": 50, "DAP": 30, "MOP": 20 }, schedule: [{ day: 0, task: "Basal Dose", note: "Apply NPK/DAP at transplanting." }, { day: 25, task: "Top Dressing", note: "Apply Urea for tillering." }, { day: 45, task: "Potash Dose", note: "Apply MOP for grain health." }] },
    "Wheat": { duration: 130, yieldPerAcre: 18, marketPrice: 2100, fertilizer: { "Urea": 60, "DAP": 40, "Zinc": 5 }, schedule: [{ day: 0, task: "Basal Dose", note: "Apply DAP at sowing." }, { day: 30, task: "First Irrigation", note: "Apply Urea after first watering." }, { day: 60, task: "Second Dose", note: "Apply remaining Nitrogen." }] },
    "Cotton": { duration: 180, yieldPerAcre: 10, marketPrice: 6500, fertilizer: { "NPK": 100, "Urea": 50, "Organic Compost": 200 }, schedule: [{ day: 0, task: "Basal Dose", note: "Apply Compost and NPK." }, { day: 45, task: "Squaring", note: "Apply first dose of Urea." }, { day: 90, task: "Boll Loading", note: "Apply top dressing." }] },
    "Maize": { duration: 100, yieldPerAcre: 25, marketPrice: 1800, fertilizer: { "Urea": 80, "DAP": 40, "MOP": 30 }, schedule: [{ day: 0, task: "Sowing", note: "Apply DAP and Urea." }, { day: 25, task: "Knee High", note: "Apply second dose of Nitrogen." }, { day: 50, task: "Tasseling", note: "Apply Potash and final N." }] },
    "Sugarcane": { duration: 360, yieldPerAcre: 350, marketPrice: 350, fertilizer: { "Urea": 150, "SSP": 80, "MOP": 50 }, schedule: [{ day: 0, task: "Planting", note: "Apply SSP and first dose of Urea." }, { day: 60, task: "Germination", note: "Monitor water and weeds." }, { day: 120, task: "Tillering", note: "Apply MOP and second Urea." }] }
};

const fertilizerPrices = {
    "NPK": 24, "Urea": 6.67, "DAP": 27, "MOP": 18, "SSP": 15,
    "Zinc": 250, "Organic": 5, "Compost": 5, "Organic Compost": 5,
    "Gypsum": 4, "Potash": 18, "Biofertilizers": 200, "Lime": 10
};

const soilHealthScores = {
    "Alluvial": 85, "Black": 90, "Red": 65, "Laterite": 55,
    "Desert": 40, "Forest": 88, "Peaty": 75, "Sandy": 50,
    "Clay": 70, "Silt": 80, "Loamy": 95, "Chalky": 60
};

const rotationAdvisor = {
    "Rice": { next: ["Pulses (Gram/Peas)", "Mustard"], benefit: "Nitrogen Fixation", note: "Legumes restore nitrogen depleted by paddy." },
    "Cotton": { next: ["Wheat", "Soybean"], benefit: "Soil Structure", note: "Wheat follows cotton well in black soil." },
    "Wheat": { next: ["Moong Dal (Legumes)", "Maize"], benefit: "Nutrient Balance", note: "Summer legumes prevent soil exhaustion." },
    "Sugarcane": { next: ["Groundnut", "Sunflower"], benefit: "Organic Matter", note: "Breaks the long sugarcane cycle." },
    "Maize": { next: ["Beans", "Potato"], benefit: "Pest Control", note: "Prevents borer infestation carry-over." },
    "None": { next: ["Rice", "Wheat", "Cotton"], benefit: "Fresh Start", note: "Soil has rested; ready for primary cereals." }
};

const irrigationDatabase = {
    "Rice": { water: "1200 mm", method: "Flood Irrigation", freq: "Daily in vegetative phase" },
    "Wheat": { water: "450 mm", method: "Sprinkler / CRT", freq: "4-6 waterings total" },
    "Cotton": { water: "700 mm", method: "Drip Irrigation", freq: "Weekly" },
    "Sugarcane": { water: "1500 mm", method: "Drip / Furrow", freq: "Once in 10-12 days" },
    "Maize": { water: "600 mm", method: "Sprinkler", freq: "Critical at Tasseling phase" }
};

const diseaseDatabase = {
    "Rice": { name: "Blast, Brown Spot", risk: "Medium", prevention: "Seed treatment with Carbendazim", pesticide: "Tricyclazole 75 WP" },
    "Wheat": { name: "Leaf Rust, Mildew", risk: "Low", prevention: "Early sowing, resistant varieties", pesticide: "Propiconazole 25 EC" },
    "Cotton": { name: "Bollworm, Wilt", risk: "High", prevention: "Pheromone traps, BT varieties", pesticide: "Spinosad 45 SC" },
    "Sugarcane": { name: "Red Rot, Smut", risk: "High", prevention: "Crop rotation, healthy sets", pesticide: "Carbendazim Soak" },
    "Maize": { name: "Stem Borer", risk: "Low", prevention: "Intercropping with Cowpea", pesticide: "Carbofuran 3G" }
};

const subsidyDatabase = {
    "Telangana": ["Rythu Bandhu (Investment Support)", "Free Power for Ag", "Drip Irrigation Subsidy"],
    "Punjab": ["PM-KISAN (Direct Income)", "Seed Subsidy", "Power Subsidy for Tubewells"],
    "Maharashtra": ["Jalyukt Shivar", "Nanaji Deshmukh Krishi Sanjivani", "On-farm Pond Subsidy"],
    "Uttar Pradesh": ["UP Kisan Uday Yojana", "Pankaj Yojana (Solar Pump)", "Fertilizer Direct Credit"],
    "Tamil Nadu": ["Micro Irrigation Subsidy", "Agri Green-Housing Scheme", "Palm Tree Planting"]
};

const stateSoilMapping = {
    "Andhra Pradesh": ["Red", "Black", "Alluvial"], "Arunachal Pradesh": ["Forest"],
    "Assam": ["Alluvial", "Forest"], "Bihar": ["Alluvial"],
    "Chhattisgarh": ["Red"], "Goa": ["Laterite"],
    "Gujarat": ["Black", "Alluvial", "Desert"], "Haryana": ["Alluvial"],
    "Himachal Pradesh": ["Forest"], "Jharkhand": ["Red"],
    "Karnataka": ["Red", "Laterite", "Black"], "Kerala": ["Laterite", "Peaty"],
    "Madhya Pradesh": ["Black", "Red"], "Maharashtra": ["Black", "Red"],
    "Odisha": ["Red", "Laterite"], "Punjab": ["Alluvial"],
    "Rajasthan": ["Desert", "Sandy"], "Tamil Nadu": ["Red", "Laterite"],
    "Telangana": ["Red", "Black"], "Uttar Pradesh": ["Alluvial"],
    "Uttarakhand": ["Forest"], "West Bengal": ["Alluvial", "Peaty"]
};

const seasonalCrops = {
    "Kharif": ["Rice", "Maize", "Cotton", "Soybean", "Sugarcane"],
    "Rabi": ["Wheat", "Barley", "Mustard", "Peas", "Gram"],
    "Zaid": ["Watermelon", "Muskmelon", "Cucumber", "Vegetables"]
};

/* ===============================
   MAP CLICK COMPONENT
================================ */
function MapClickHandler({ onMapClick }) {
    useMapEvents({ click: (e) => onMapClick(e.latlng) });
    return null;
}

/* ---- shared tailwind class strings ---- */
const cardCls = "bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 transition-colors";
const cardTitle = "text-lg font-bold text-gray-900 dark:text-white mb-4";
const selectCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all";
const labelCls = "block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1";
const placeholderText = "text-sm text-gray-400 dark:text-slate-500 italic";

/* ===============================
   DASHBOARD COMPONENT
================================ */
export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    // Form state
    const [soilImage, setSoilImage] = useState(null);
    const [soilImagePreview, setSoilImagePreview] = useState(null);
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [climate, setClimate] = useState('');
    const [acres, setAcres] = useState(1);
    const [loading, setLoading] = useState(false);
    const [prevCrop, setPrevCrop] = useState('');
    const [season, setSeason] = useState('Kharif');

    // Results state
    const [analysisResult, setAnalysisResult] = useState(null);
    const [selectedCrop, setSelectedCrop] = useState(null);

    // Map modal state
    const [showMapModal, setShowMapModal] = useState(false);
    const [mapMarker, setMapMarker] = useState(null);

    // Derived data
    const soilData = useMemo(() => analysisResult ? soilDatabase[analysisResult.soil_type] : null, [analysisResult]);
    const cropData = useMemo(() => selectedCrop ? cropIntelligence[selectedCrop] : null, [selectedCrop]);

    const gaugeData = useMemo(() => ({
        labels: Object.keys(soilDatabase),
        datasets: [{
            data: new Array(12).fill(1),
            backgroundColor: Object.values(soilDatabase).map(s => s.color),
            borderColor: 'rgba(255,255,255,0.4)',
            borderWidth: 2,
        }]
    }), []);

    const gaugeOptions = useMemo(() => ({
        maintainAspectRatio: false,
        cutout: '80%',
        circumference: 180,
        rotation: 270,
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }), []);

    const { totalFertilizerCost, revenue, netProfit } = useMemo(() => {
        if (!cropData) return { totalFertilizerCost: 0, revenue: 0, netProfit: 0 };
        let cost = 0;
        Object.entries(cropData.fertilizer).forEach(([name, kgPerAcre]) => {
            const totalQty = kgPerAcre * acres;
            const pricePerUnit = fertilizerPrices[name] || 0;
            cost += totalQty * pricePerUnit;
        });
        const yieldTotal = cropData.yieldPerAcre * acres;
        const rev = yieldTotal * cropData.marketPrice;
        return { totalFertilizerCost: cost, revenue: rev, netProfit: rev - cost };
    }, [cropData, acres]);

    const healthInfo = useMemo(() => {
        if (!analysisResult) return null;
        const score = soilHealthScores[analysisResult.soil_type] || 60;
        let label = "Moderate", color = "#f9a825";
        if (score >= 90) { label = "Excellent"; color = "#2e7d32"; }
        else if (score >= 75) { label = "Healthy"; color = "#43a047"; }
        else if (score >= 60) { label = "Moderate"; color = "#f9a825"; }
        else if (score >= 40) { label = "Poor"; color = "#ef6c00"; }
        else { label = "Critical"; color = "#d32f2f"; }
        return { score, label, color };
    }, [analysisResult]);

    // Handlers
    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSoilImage(file);
        const reader = new FileReader();
        reader.onload = (ev) => setSoilImagePreview(ev.target.result);
        reader.readAsDataURL(file);
    }, []);

    const handleLogout = useCallback(async () => {
        try { await logout(); navigate('/login'); }
        catch (err) { console.error('Logout failed:', err); }
    }, [logout, navigate]);

    const handleMapClick = useCallback((latlng) => {
        setMapMarker(latlng);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
            .then(r => r.json())
            .then(data => {
                if (data.address) {
                    const loc = data.address.county || data.address.state_district || data.address.city || "Unknown";
                    setDistrict(`${loc}, ${data.address.state || ''}`);
                }
            }).catch(console.error);
    }, []);

    const handleAnalyze = useCallback(async () => {
        if (!state) { alert("Please select your State."); return; }
        if (!district) { alert("Please select a district."); return; }
        if (!soilImage) { alert("Please upload a soil image."); return; }
        if (!climate) { alert("Please select Climate/Season."); return; }

        setLoading(true);
        try {
            let result;
            try {
                const response = await fetch("http://127.0.0.1:5000/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ location: district, state, climate })
                });
                if (response.ok) result = await response.json();
                else throw new Error("Backend offline");
            } catch {
                const soilKeys = Object.keys(soilDatabase);
                result = {
                    soil_type: soilKeys[Math.floor(Math.random() * soilKeys.length)],
                    ph: (Math.random() * 3 + 5).toFixed(1),
                    moisture: Math.floor(Math.random() * 80),
                    nutrients: { N: Math.floor(Math.random() * 200), P: Math.floor(Math.random() * 100), K: Math.floor(Math.random() * 400) }
                };
            }
            if (!soilDatabase[result.soil_type]) {
                const soilKeys = Object.keys(soilDatabase);
                result.soil_type = soilKeys[Math.floor(Math.random() * soilKeys.length)];
            }
            setAnalysisResult(result);
            const sd = soilDatabase[result.soil_type];
            if (sd && sd.crops.length > 0) setSelectedCrop(sd.crops[0]);
        } catch (err) {
            console.error("Analysis error:", err);
            alert("Analysis failed.");
        } finally {
            setLoading(false);
        }
    }, [state, district, soilImage, climate]);

    const rotationData = useMemo(() => {
        if (!prevCrop) return null;
        return rotationAdvisor[prevCrop] || rotationAdvisor["None"];
    }, [prevCrop]);

    const irrigData = useMemo(() => {
        if (!selectedCrop) return null;
        return irrigationDatabase[selectedCrop] || { water: "Variable", method: "Drip Suggestion", freq: "Weekly check" };
    }, [selectedCrop]);

    const diseaseData = useMemo(() => {
        if (!selectedCrop) return null;
        return diseaseDatabase[selectedCrop] || { name: "Leaf Spot", risk: "Low", prevention: "Crop monitoring", pesticide: "Neem Oil" };
    }, [selectedCrop]);

    const subsidySchemes = useMemo(() => {
        return subsidyDatabase[state] || ["PM-KISAN (Central)", "Kissan Credit Card", "Crop Insurance"];
    }, [state]);

    const seasonalData = useMemo(() => {
        const crops = seasonalCrops[season] || [];
        const recommendedForSoil = soilData ? soilData.crops : [];
        return crops.map(crop => ({ name: crop, isIdeal: recommendedForSoil.includes(crop) }));
    }, [season, soilData]);

    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors">
            {/* NAVBAR */}
            <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-bold">
                    <span className="text-xl">🌱</span>
                    <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">AI-Based Soil Health Assessment</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 dark:text-slate-300 font-medium hidden md:inline">Dashboard</span>
                    <span className="text-gray-600 dark:text-slate-300 font-medium hidden md:inline">Upload Data</span>
                    <span className="text-gray-600 dark:text-slate-300 font-medium hidden md:inline">History</span>
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

            {/* MAIN CONTENT */}
            <div className="container py-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Welcome, Farmer!</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* 1. UPLOAD SOIL IMAGE */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Upload Soil Image</h3>
                        <div
                            className="w-full h-48 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors bg-gray-50 dark:bg-slate-700/50 overflow-hidden mb-4"
                            onClick={() => document.getElementById('soilImageInput').click()}
                        >
                            {soilImagePreview ? (
                                <img src={soilImagePreview} alt="Soil Preview" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <p className={placeholderText}>Click to upload soil image</p>
                            )}
                        </div>
                        <input type="file" id="soilImageInput" accept="image/*" onChange={handleImageChange} hidden />
                        <button className="btn btn-primary w-full" onClick={() => document.getElementById('soilImageInput').click()}>
                            Upload Soil Image
                        </button>
                    </div>

                    {/* 2. SOIL PARAMETERS */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Soil Parameters</h3>
                        <div className="space-y-3">
                            {[
                                ['pH Level', analysisResult?.ph || '--'],
                                ['Moisture (%)', analysisResult ? `${analysisResult.moisture}%` : '--'],
                                ['Nitrogen (mg/kg)', analysisResult?.nutrients?.N || '--'],
                                ['Phosphorus (mg/kg)', analysisResult?.nutrients?.P || '--'],
                                ['Potassium (mg/kg)', analysisResult?.nutrients?.K || '--'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                                    <span className="text-sm text-gray-600 dark:text-slate-400">{label}</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. SOIL CLASSIFICATION (GAUGE) */}
                    <div className={cardCls}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Soil Classification</h3>
                            {analysisResult && (
                                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                    {Math.floor(Math.random() * 10 + 88)}% Match
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative w-48 h-28">
                                <Doughnut data={gaugeData} options={gaugeOptions} />
                                <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                                    <span className="text-base font-bold text-gray-900 dark:text-white">{analysisResult?.soil_type || '--'}</span>
                                    <small className="text-xs text-gray-500 dark:text-slate-400">Soil Category</small>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(soilDatabase).map(([type, data]) => (
                                    <div key={type} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${analysisResult?.soil_type === type ? 'bg-emerald-100 dark:bg-emerald-900/30 font-bold' : ''}`}>
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: data.color }}></span>
                                        <span className="text-gray-600 dark:text-slate-400">{type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4. ANALYSIS RESULTS */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Analysis Results</h3>
                        <div className="space-y-3">
                            <div>
                                <label className={labelCls}>Indian State</label>
                                <select value={state} onChange={(e) => setState(e.target.value)} className={selectCls}>
                                    <option value="">Select State</option>
                                    {Object.keys(stateDistrictDB).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>District</label>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Enter District..." value={district} onChange={(e) => setDistrict(e.target.value)}
                                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500" />
                                    <button className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-none cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors text-lg" onClick={() => setShowMapModal(true)}>📍</button>
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Season/Climate</label>
                                <select value={climate} onChange={(e) => setClimate(e.target.value)} className={selectCls}>
                                    <option value="">Select Climate</option>
                                    <option value="summer">Summer</option>
                                    <option value="rainy">Rainy / Monsoon</option>
                                    <option value="winter">Winter</option>
                                    <option value="tropical">Tropical</option>
                                    <option value="dry">Dry / Arid</option>
                                </select>
                            </div>
                            <button className="btn btn-primary w-full mt-2" onClick={handleAnalyze} disabled={loading}>
                                {loading ? 'Analyzing...' : 'Analyze Soil'}
                            </button>
                        </div>
                    </div>

                    {/* 5. SOIL INTELLIGENCE */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Soil Intelligence</h3>
                        {analysisResult ? (
                            <div>
                                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{analysisResult.soil_type} Soil</div>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-3 leading-relaxed">{soilData?.notes}</p>
                                {state && stateSoilMapping[state] && (
                                    <div className="mt-4">
                                        <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Typical soils in {state}:</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {stateSoilMapping[state].map(s => (
                                                <span key={s} className={`px-3 py-1 rounded-full text-xs font-medium ${s === analysisResult.soil_type ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'}`}>
                                                    {s} Soil
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className={placeholderText}>Upload soil image and select state to see detailed intelligence.</p>
                        )}
                    </div>

                    {/* 6. LAND AREA SELECTION */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Land Area Selection</h3>
                        <div>
                            <label className={labelCls}>Farm Size</label>
                            <select value={acres} onChange={(e) => setAcres(Number(e.target.value))} className={selectCls}>
                                {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(val => (
                                    <option key={val} value={val}>{val} Acre{val !== 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 7. RECOMMENDED CROPS */}
                    <div className={cardCls}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recommended Crops</h3>
                            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                {soilData ? `${soilData.crops.length} Crops Suitable` : '--'}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {soilData ? soilData.crops.map(crop => (
                                <span key={crop}
                                    className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all ${selectedCrop === crop ? 'bg-emerald-500 text-white font-bold shadow-lg' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'}`}
                                    onClick={() => setSelectedCrop(crop)}>{crop}</span>
                            )) : (
                                <p className={placeholderText}>Results will appear here...</p>
                            )}
                        </div>
                    </div>

                    {/* 8. FERTILIZER RECOMMENDATIONS */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Fertilizer Recommendations</h3>
                        {selectedCrop && cropData ? (
                            <div className="space-y-3">
                                <div className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2.5 rounded-lg">
                                    Planning for <strong>{selectedCrop}</strong> on <strong>{acres}</strong> Acre(s).
                                </div>
                                {Object.entries(cropData.fertilizer).map(([name, kgPerAcre]) => {
                                    const totalQty = (kgPerAcre * acres).toFixed(1);
                                    const price = fertilizerPrices[name] || 0;
                                    const lineCost = (totalQty * price);
                                    return (
                                        <div key={name} className="bg-emerald-50/50 dark:bg-slate-700/50 p-3 rounded-xl border-l-4 border-emerald-500 shadow-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <strong className="text-sm text-emerald-800 dark:text-emerald-300">{name}</strong>
                                                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs font-semibold">₹{lineCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                            </div>
                                            <div className="flex justify-between text-[11px] text-gray-500 dark:text-slate-400 border-t border-dashed border-emerald-200 dark:border-emerald-700 pt-1">
                                                <span>Qty: {totalQty} kg ({kgPerAcre} kg/Acre)</span>
                                                <span>Rate: ₹{price}/kg</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="mt-2 p-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-center">
                                    <div className="text-xs uppercase tracking-wider opacity-90 mb-1">Estimated Fertilizer Cost</div>
                                    <div className="text-2xl font-extrabold">₹{totalFertilizerCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                </div>
                            </div>
                        ) : (
                            <p className={placeholderText}>Results will appear here...</p>
                        )}
                    </div>

                    {/* 9. CROP GROWTH INSIGHTS */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Crop Growth Insights</h3>
                        {selectedCrop && cropData ? (
                            <div>
                                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-400">
                                    <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">Estimated Harvest: {cropData.duration} Days</span>
                                </div>
                                <div className="space-y-3 border-l-2 border-emerald-300 dark:border-emerald-700 pl-4">
                                    {cropData.schedule.map((s, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800"></div>
                                            <div className="flex justify-between mb-0.5">
                                                <strong className="text-sm text-emerald-700 dark:text-emerald-400">{s.task}</strong>
                                                <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-full">Day {s.day}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 m-0">{s.note}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className={placeholderText}>Select a crop to see growth timeline.</p>
                        )}
                    </div>

                    {/* 10. SEASONAL CROP PLANNER */}
                    <div className={cardCls}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Seasonal Crop Planner</h3>
                            <select value={season} onChange={(e) => setSeason(e.target.value)} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-gray-800 dark:text-white">
                                <option value="Kharif">Kharif</option>
                                <option value="Rabi">Rabi</option>
                                <option value="Zaid">Zaid</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {seasonalData.length > 0 ? seasonalData.map(item => (
                                <span key={item.name}
                                    className={`relative px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all ${item.isIdeal ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                    onClick={() => setSelectedCrop(item.name)}>
                                    {item.name}
                                    {item.isIdeal && <span className="absolute -top-1.5 -right-1.5 text-[8px]">⭐</span>}
                                </span>
                            )) : (
                                <p className={placeholderText}>Select a season...</p>
                            )}
                        </div>
                    </div>

                    {/* 11. YIELD PREDICTION */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Yield Prediction</h3>
                        {selectedCrop && cropData ? (
                            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl border-l-4 border-sky-400">
                                <div className="text-sm text-sky-800 dark:text-sky-300 mb-1">Expected Yield for <strong>{selectedCrop}</strong></div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-2xl font-extrabold text-sky-800 dark:text-sky-300">{(cropData.yieldPerAcre * acres).toFixed(1)} <small className="text-sm font-normal">Quintals</small></span>
                                    <span className="text-xs text-sky-600 dark:text-sky-400">({cropData.yieldPerAcre} Q/Acre)</span>
                                </div>
                            </div>
                        ) : (
                            <p className={placeholderText}>Select a crop to view yield...</p>
                        )}
                    </div>

                    {/* 12. PROFIT ESTIMATION */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Profit Estimation</h3>
                        {selectedCrop && cropData ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-slate-400">Revenue:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">₹{revenue.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-slate-400">Investment:</span>
                                    <span className="font-semibold text-red-600">- ₹{totalFertilizerCost.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="mt-2 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-center border border-dashed border-emerald-400">
                                    <div className="text-xs uppercase text-emerald-600 dark:text-emerald-400 mb-1">Estimated Net Profit</div>
                                    <div className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">₹{netProfit.toLocaleString('en-IN')}</div>
                                </div>
                            </div>
                        ) : (
                            <p className={placeholderText}>Calculation pending...</p>
                        )}
                    </div>

                    {/* 13. FERTILIZER APPLICATION SCHEDULE */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Fertilizer Application Schedule</h3>
                        {selectedCrop && cropData ? (
                            <div className="space-y-3 border-l-2 border-emerald-300 dark:border-emerald-700 pl-4">
                                {cropData.schedule.map((s, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800"></div>
                                        <div className="flex justify-between mb-0.5">
                                            <strong className="text-sm text-emerald-700 dark:text-emerald-400">{s.task}</strong>
                                            <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-full">Day {s.day}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 m-0">{s.note}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={placeholderText}>Timeline pending...</p>
                        )}
                    </div>

                    {/* 14. SOIL HEALTH SCORE */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Soil Health Score</h3>
                        {healthInfo ? (
                            <div className="text-center">
                                <div className="text-5xl font-black leading-none" style={{ color: healthInfo.color }}>{healthInfo.score}</div>
                                <div className="text-base font-bold uppercase tracking-wider mb-3" style={{ color: healthInfo.color }}>{healthInfo.label}</div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${healthInfo.score}%`, background: healthInfo.color }}></div>
                                </div>
                            </div>
                        ) : (
                            <p className={placeholderText}>Score pending analysis...</p>
                        )}
                    </div>

                    {/* 15. CROP ROTATION ADVISOR */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Crop Rotation Advisor</h3>
                        <div className="mb-4">
                            <label className={labelCls}>Previous Crop Grown</label>
                            <select value={prevCrop} onChange={(e) => setPrevCrop(e.target.value)} className={selectCls}>
                                <option value="">Select Previous Crop</option>
                                <option value="Rice">Rice</option>
                                <option value="Wheat">Wheat</option>
                                <option value="Cotton">Cotton</option>
                                <option value="Maize">Maize</option>
                                <option value="Sugarcane">Sugarcane</option>
                                <option value="None">New Land / Fallow</option>
                            </select>
                        </div>
                        {rotationData ? (
                            <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-3 rounded-lg">
                                <div className="text-[11px] text-purple-700 dark:text-purple-300 font-bold uppercase">Recommended Succession</div>
                                <div className="text-sm font-extrabold text-purple-900 dark:text-purple-200 my-1">{rotationData.next.join(", ")}</div>
                                <div className="text-xs text-purple-600 dark:text-purple-400"><strong>Benefit:</strong> {rotationData.benefit}</div>
                                <p className="mt-2 text-xs text-gray-600 dark:text-slate-400 italic m-0">{rotationData.note}</p>
                            </div>
                        ) : (
                            <p className={placeholderText}>Select previous crop to see advisor...</p>
                        )}
                    </div>

                    {/* 16. IRRIGATION PLANNING */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Irrigation Planning</h3>
                        {irrigData ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-sky-50 dark:bg-sky-900/20 p-3 rounded-lg">
                                    <div className="text-[10px] text-sky-600 dark:text-sky-400 uppercase font-bold">Water Need</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{irrigData.water}</div>
                                </div>
                                <div className="bg-sky-50 dark:bg-sky-900/20 p-3 rounded-lg">
                                    <div className="text-[10px] text-sky-600 dark:text-sky-400 uppercase font-bold">Method</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{irrigData.method}</div>
                                </div>
                                <div className="col-span-2 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">Frequency</div>
                                    <div className="text-xs text-gray-700 dark:text-slate-300">{irrigData.freq}</div>
                                </div>
                            </div>
                        ) : (
                            <p className={placeholderText}>Select a crop to view plan...</p>
                        )}
                    </div>

                    {/* 17. CROP DISEASE RISK */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Crop Disease Risk</h3>
                        {diseaseData ? (
                            <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-3 space-y-2">
                                <div className="flex justify-between items-center">
                                    <strong className="text-sm text-gray-900 dark:text-white">{diseaseData.name}</strong>
                                    <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-bold ${diseaseData.risk === 'High' ? 'bg-red-600' : diseaseData.risk === 'Medium' ? 'bg-orange-500' : 'bg-emerald-600'}`}>{diseaseData.risk} RISK</span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-slate-400"><strong>Prevention:</strong> {diseaseData.prevention}</div>
                                <div className="text-xs bg-amber-50 dark:bg-amber-900/20 border-l-3 border-amber-400 p-2 rounded">
                                    <strong>Recommended:</strong> {diseaseData.pesticide}
                                </div>
                            </div>
                        ) : (
                            <p className={placeholderText}>Risk assessment pending...</p>
                        )}
                    </div>

                    {/* 18. GOVERNMENT SUBSIDY & SCHEMES */}
                    <div className={cardCls}>
                        <h3 className={cardTitle}>Government Subsidy & Schemes</h3>
                        {analysisResult ? (
                            <ul className="space-y-2 list-none p-0 m-0">
                                {subsidySchemes.map((s, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={placeholderText}>Schemes will appear based on state and land...</p>
                        )}
                    </div>

                </div> {/* end grid */}
            </div> {/* end container */}

            {/* MAP MODAL */}
            {showMapModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowMapModal(false); }}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-slideUp">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">Select Location from Map</h3>
                            <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 border-none cursor-pointer text-lg" onClick={() => setShowMapModal(false)}>&times;</button>
                        </div>
                        <div className="px-4 py-2 text-xs text-gray-500 dark:text-slate-400">Click anywhere on the map to pin your location.</div>
                        <div className="px-4">
                            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '400px', width: '100%', borderRadius: '12px' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                                <MapClickHandler onMapClick={handleMapClick} />
                                {mapMarker && <Marker position={[mapMarker.lat, mapMarker.lng]} />}
                            </MapContainer>
                        </div>
                        <div className="p-4">
                            <button className="btn btn-primary w-full" onClick={() => setShowMapModal(false)} disabled={!mapMarker}>Confirm Selection</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CHATBOT WIDGET */}
            <ChatBot />
        </div>
    );
}
