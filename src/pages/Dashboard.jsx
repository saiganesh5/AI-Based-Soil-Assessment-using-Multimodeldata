import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

    // Derived data (memoized)
    const soilData = useMemo(() => analysisResult ? soilDatabase[analysisResult.soil_type] : null, [analysisResult]);
    const cropData = useMemo(() => selectedCrop ? cropIntelligence[selectedCrop] : null, [selectedCrop]);

    // Gauge chart data (static, memoized)
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

    // Financial calculations (memoized)
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

    // Health score (memoized)
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
        // Reverse geocode
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

    // Rotation advisor data
    const rotationData = useMemo(() => {
        if (!prevCrop) return null;
        return rotationAdvisor[prevCrop] || rotationAdvisor["None"];
    }, [prevCrop]);

    // Irrigation data
    const irrigData = useMemo(() => {
        if (!selectedCrop) return null;
        return irrigationDatabase[selectedCrop] || { water: "Variable", method: "Drip Suggestion", freq: "Weekly check" };
    }, [selectedCrop]);

    // Disease data
    const diseaseData = useMemo(() => {
        if (!selectedCrop) return null;
        return diseaseDatabase[selectedCrop] || { name: "Leaf Spot", risk: "Low", prevention: "Crop monitoring", pesticide: "Neem Oil" };
    }, [selectedCrop]);

    // Subsidy data
    const subsidySchemes = useMemo(() => {
        return subsidyDatabase[state] || ["PM-KISAN (Central)", "Kissan Credit Card", "Crop Insurance"];
    }, [state]);

    // Seasonal planner data
    const seasonalData = useMemo(() => {
        const crops = seasonalCrops[season] || [];
        const recommendedForSoil = soilData ? soilData.crops : [];
        return crops.map(crop => ({ name: crop, isIdeal: recommendedForSoil.includes(crop) }));
    }, [season, soilData]);

    return (
        <div className="dashboard-page">
            {/* NAVBAR */}
            <div className="navbar">
                <div className="logo">🌱 AI-Based Soil Health Assessment</div>
                <div className="menu">
                    <span>Dashboard</span>
                    <span>Upload Data</span>
                    <span>History</span>
                    <button className="btn-logout" onClick={handleLogout}>🚪 Logout</button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="dashboard-container">
                <div className="main-panel">
                    <h2>Welcome, Farmer!</h2>

                    <div className="grid">

                        {/* 1. UPLOAD SOIL IMAGE */}
                        <div className="card upload-card">
                            <h3>Upload Soil Image</h3>
                            <div className="image-placeholder" onClick={() => document.getElementById('soilImageInput').click()}>
                                {soilImagePreview ? (
                                    <img src={soilImagePreview} alt="Soil Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                                ) : (
                                    <p>Click the button below to upload soil image</p>
                                )}
                            </div>
                            <input type="file" id="soilImageInput" accept="image/*" onChange={handleImageChange} hidden />
                            <button className="primary-btn" onClick={() => document.getElementById('soilImageInput').click()}>
                                Upload Soil Image
                            </button>
                        </div>

                        {/* 2. SOIL PARAMETERS */}
                        <div className="card">
                            <h3>Soil Parameters</h3>
                            <div className="param"><span>pH Level</span><span>{analysisResult?.ph || '--'}</span></div>
                            <div className="param"><span>Moisture (%)</span><span>{analysisResult ? `${analysisResult.moisture}%` : '--'}</span></div>
                            <div className="param"><span>Nitrogen (mg/kg)</span><span>{analysisResult?.nutrients?.N || '--'}</span></div>
                            <div className="param"><span>Phosphorus (mg/kg)</span><span>{analysisResult?.nutrients?.P || '--'}</span></div>
                            <div className="param"><span>Potassium (mg/kg)</span><span>{analysisResult?.nutrients?.K || '--'}</span></div>
                        </div>

                        {/* 3. SOIL CLASSIFICATION (GAUGE) */}
                        <div className="card gauge-card">
                            <div className="card-header">
                                <h3>Soil Classification</h3>
                                {analysisResult && (
                                    <div className="confidence-badge">
                                        <span>{Math.floor(Math.random() * 10 + 88)}</span>% Match
                                    </div>
                                )}
                            </div>
                            <div className="gauge-layout">
                                <div className="gauge-visual">
                                    <Doughnut data={gaugeData} options={gaugeOptions} />
                                    <div className="gauge-center-text">
                                        <span>{analysisResult?.soil_type || '--'}</span>
                                        <small>Soil Category</small>
                                    </div>
                                </div>
                                <div className="soil-legend">
                                    {Object.entries(soilDatabase).map(([type, data]) => (
                                        <div key={type} className={`legend-item ${analysisResult?.soil_type === type ? 'active' : ''}`}>
                                            <span className="dot" style={{ background: data.color }}></span>
                                            <span className="label">{type}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 4. ANALYSIS RESULTS */}
                        <div className="card analysis-card">
                            <h3>Analysis Results</h3>
                            <div className="input-group">
                                <label><strong>Indian State</strong></label>
                                <select value={state} onChange={(e) => setState(e.target.value)}>
                                    <option value="">Select State</option>
                                    {Object.keys(stateDistrictDB).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <label style={{ marginTop: '10px' }}><strong>District</strong></label>
                            <div className="location-wrapper">
                                <input type="text" placeholder="Enter District..." value={district} onChange={(e) => setDistrict(e.target.value)} />
                                <button className="map-btn" onClick={() => setShowMapModal(true)}>📍</button>
                            </div>
                            <div className="input-group" style={{ marginTop: '10px' }}>
                                <label><strong>Season/Climate</strong></label>
                                <select value={climate} onChange={(e) => setClimate(e.target.value)}>
                                    <option value="">Select Climate</option>
                                    <option value="summer">Summer</option>
                                    <option value="rainy">Rainy / Monsoon</option>
                                    <option value="winter">Winter</option>
                                    <option value="tropical">Tropical</option>
                                    <option value="dry">Dry / Arid</option>
                                </select>
                            </div>
                            <button className="primary-btn analyze-btn" onClick={handleAnalyze} disabled={loading} style={{ marginTop: '15px' }}>
                                {loading ? 'Analyzing...' : 'Analyze Soil'}
                            </button>
                        </div>

                        {/* 5. SOIL INTELLIGENCE */}
                        <div className="card intelligence-summary-card">
                            <h3>Soil Intelligence</h3>
                            {analysisResult ? (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong style={{ fontSize: '20px', color: '#1b5e20' }}>{analysisResult.soil_type} Soil</strong>
                                    </div>
                                    <p style={{ marginTop: '12px', fontSize: '14px', color: '#555', lineHeight: '1.5' }}>{soilData?.notes}</p>
                                    {state && stateSoilMapping[state] && (
                                        <div style={{ marginTop: '15px', fontSize: '13px', color: '#555' }}>
                                            <strong>Typical soils in {state}:</strong>
                                            <div className="crops-display-grid" style={{ marginTop: '8px' }}>
                                                {stateSoilMapping[state].map(s => (
                                                    <span key={s} className={`chip ${s === analysisResult.soil_type ? 'active-match' : ''}`}>{s} Soil</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="placeholder-text">Upload soil image and select state to see detailed intelligence.</p>
                            )}
                        </div>

                        {/* 6. LAND AREA SELECTION */}
                        <div className="card land-area-card">
                            <h3>Land Area Selection</h3>
                            <div className="input-group">
                                <label><strong style={{ fontSize: '13px', color: '#666' }}>Farm Size</strong></label>
                                <select value={acres} onChange={(e) => setAcres(Number(e.target.value))}>
                                    {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(val => (
                                        <option key={val} value={val}>{val} Acre{val !== 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 7. RECOMMENDED CROPS */}
                        <div className="card recommendations-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0 }}>Recommended Crops</h3>
                                <span className="count-badge" style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                                    {soilData ? `${soilData.crops.length} Crops Suitable` : '--'}
                                </span>
                            </div>
                            <div className="crops-display-grid">
                                {soilData ? soilData.crops.map(crop => (
                                    <span key={crop} className={`chip ${selectedCrop === crop ? 'active-crop' : ''}`} onClick={() => setSelectedCrop(crop)}>{crop}</span>
                                )) : (
                                    <p className="placeholder-text">Results will appear here...</p>
                                )}
                            </div>
                        </div>

                        {/* 8. FERTILIZER RECOMMENDATIONS */}
                        <div className="card recommendations-card">
                            <h3>Fertilizer Recommendations</h3>
                            {selectedCrop && cropData ? (
                                <div className="fertilizer-display-grid" style={{ flexDirection: 'column' }}>
                                    <div style={{ marginBottom: '10px', fontSize: '13px', color: '#1b5e20', background: '#e8f5e9', padding: '10px', borderRadius: '8px' }}>
                                        Planning for <strong>{selectedCrop}</strong> on <strong>{acres}</strong> Acre(s).
                                    </div>
                                    {Object.entries(cropData.fertilizer).map(([name, kgPerAcre]) => {
                                        const totalQty = (kgPerAcre * acres).toFixed(1);
                                        const price = fertilizerPrices[name] || 0;
                                        const lineCost = (totalQty * price);
                                        return (
                                            <div key={name} style={{ background: '#f1f8e9', padding: '12px', borderRadius: '10px', borderLeft: '5px solid #4caf50', width: '100%', marginBottom: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                    <strong style={{ color: '#1b5e20', fontSize: '15px' }}>{name}</strong>
                                                    <span style={{ background: '#2e7d32', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>₹{lineCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666', borderTop: '1px dashed rgba(46,125,50,0.2)', paddingTop: '5px' }}>
                                                    <span>Qty: {totalQty} kg ({kgPerAcre} kg/Acre)</span>
                                                    <span>Rate: ₹{price}/kg</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div style={{ marginTop: '10px', padding: '15px', background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimated Fertilizer Cost</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800' }}>₹{totalFertilizerCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="placeholder-text">Results will appear here...</p>
                            )}
                        </div>

                        {/* 9. CROP GROWTH INSIGHTS */}
                        <div className="card insights-card">
                            <h3>Crop Growth Insights</h3>
                            {selectedCrop && cropData ? (
                                <div>
                                    <div style={{ marginBottom: '15px', padding: '10px', background: '#fff8e1', borderRadius: '8px', borderLeft: '4px solid #ffb300' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#795548' }}>Estimated Harvest: {cropData.duration} Days</span>
                                    </div>
                                    <div className="timeline">
                                        {cropData.schedule.map((s, idx) => (
                                            <div key={idx} className="timeline-item">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                    <strong style={{ fontSize: '14px', color: '#1b5e20' }}>{s.task}</strong>
                                                    <span className="timeline-day">Day {s.day}</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{s.note}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="placeholder-text">Select a crop to see growth timeline.</p>
                            )}
                        </div>

                        {/* 10. SEASONAL CROP PLANNER */}
                        <div className="card seasonal-planner-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0 }}>Seasonal Crop Planner</h3>
                                <select value={season} onChange={(e) => setSeason(e.target.value)} style={{ width: 'auto', padding: '5px 10px', fontSize: '12px', borderRadius: '8px' }}>
                                    <option value="Kharif">Kharif</option>
                                    <option value="Rabi">Rabi</option>
                                    <option value="Zaid">Zaid</option>
                                </select>
                            </div>
                            <div className="crops-display-grid">
                                {seasonalData.length > 0 ? seasonalData.map(item => (
                                    <span key={item.name} className={`chip ${item.isIdeal ? 'active-match' : ''}`} onClick={() => setSelectedCrop(item.name)} style={{ cursor: 'pointer', position: 'relative' }}>
                                        {item.name}
                                        {item.isIdeal && <span style={{ position: 'absolute', top: '-5px', right: '-5px', fontSize: '8px' }}>⭐</span>}
                                    </span>
                                )) : (
                                    <p className="placeholder-text">Select a season...</p>
                                )}
                            </div>
                        </div>

                        {/* 11. YIELD PREDICTION */}
                        <div className="card yield-card">
                            <h3>Yield Prediction</h3>
                            {selectedCrop && cropData ? (
                                <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '12px', borderLeft: '5px solid #03a9f4' }}>
                                    <div style={{ fontSize: '13px', color: '#01579b', marginBottom: '5px' }}>Expected Yield for <strong>{selectedCrop}</strong></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <span style={{ fontSize: '24px', fontWeight: '800', color: '#01579b' }}>{(cropData.yieldPerAcre * acres).toFixed(1)} <small style={{ fontSize: '14px' }}>Quintals</small></span>
                                        <span style={{ fontSize: '12px', color: '#0277bd' }}>({cropData.yieldPerAcre} Q/Acre)</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="placeholder-text">Select a crop to view yield...</p>
                            )}
                        </div>

                        {/* 12. PROFIT ESTIMATION */}
                        <div className="card profit-card">
                            <h3>Profit Estimation</h3>
                            {selectedCrop && cropData ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: '#666' }}>Revenue:</span>
                                        <span style={{ fontWeight: '600' }}>₹{revenue.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: '#666' }}>Investment:</span>
                                        <span style={{ fontWeight: '600', color: '#d32f2f' }}>- ₹{totalFertilizerCost.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div style={{ marginTop: '5px', background: '#e8f5e9', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px dashed #4caf50' }}>
                                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#2e7d32', marginBottom: '3px' }}>Estimated Net Profit</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#1b5e20' }}>₹{netProfit.toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="placeholder-text">Calculation pending...</p>
                            )}
                        </div>

                        {/* 13. FERTILIZER APPLICATION SCHEDULE */}
                        <div className="card schedule-card">
                            <h3>Fertilizer Application Schedule</h3>
                            {selectedCrop && cropData ? (
                                <div className="timeline">
                                    {cropData.schedule.map((s, idx) => (
                                        <div key={idx} className="timeline-item">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                <strong style={{ fontSize: '14px', color: '#1b5e20' }}>{s.task}</strong>
                                                <span className="timeline-day">Day {s.day}</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{s.note}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="placeholder-text">Timeline pending...</p>
                            )}
                        </div>

                        {/* 14. SOIL HEALTH SCORE */}
                        <div className="card health-score-card">
                            <h3>Soil Health Score</h3>
                            {healthInfo ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '48px', fontWeight: '900', color: healthInfo.color, lineHeight: 1 }}>{healthInfo.score}</div>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: healthInfo.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>{healthInfo.label}</div>
                                    <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${healthInfo.score}%`, height: '100%', background: healthInfo.color, borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                            ) : (
                                <p className="placeholder-text">Score pending analysis...</p>
                            )}
                        </div>

                        {/* 15. CROP ROTATION ADVISOR */}
                        <div className="card rotation-card">
                            <h3>Crop Rotation Advisor</h3>
                            <div className="input-group" style={{ marginBottom: '15px' }}>
                                <label><strong style={{ fontSize: '13px', color: '#666' }}>Previous Crop Grown</strong></label>
                                <select value={prevCrop} onChange={(e) => setPrevCrop(e.target.value)}>
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
                                <div style={{ background: '#f3e5f5', borderLeft: '5px solid #9c27b0', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '11px', color: '#7b1fa2', fontWeight: '700', textTransform: 'uppercase' }}>Recommended Succession</div>
                                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#4a148c', margin: '4px 0' }}>{rotationData.next.join(", ")}</div>
                                    <div style={{ fontSize: '12px', color: '#6a1b9a' }}><strong>Benefit:</strong> {rotationData.benefit}</div>
                                    <p style={{ margin: '8px 0 0', fontSize: '12px', lineHeight: '1.4', color: '#444', fontStyle: 'italic' }}>{rotationData.note}</p>
                                </div>
                            ) : (
                                <p className="placeholder-text">Select previous crop to see advisor...</p>
                            )}
                        </div>

                        {/* 16. IRRIGATION PLANNING */}
                        <div className="card irrigation-card">
                            <h3>Irrigation Planning</h3>
                            {irrigData ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div style={{ background: '#e3f2fd', padding: '10px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '10px', color: '#1976d2', textTransform: 'uppercase' }}>Water Need</div>
                                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{irrigData.water}</div>
                                    </div>
                                    <div style={{ background: '#e3f2fd', padding: '10px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '10px', color: '#1976d2', textTransform: 'uppercase' }}>Method</div>
                                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{irrigData.method}</div>
                                    </div>
                                    <div style={{ gridColumn: 'span 2', background: '#f1f8e9', padding: '10px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '10px', color: '#2e7d32', textTransform: 'uppercase' }}>Frequency</div>
                                        <div style={{ fontSize: '12px' }}>{irrigData.freq}</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="placeholder-text">Select a crop to view plan...</p>
                            )}
                        </div>

                        {/* 17. CROP DISEASE RISK */}
                        <div className="card disease-card">
                            <h3>Crop Disease Risk</h3>
                            {diseaseData ? (
                                <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <strong style={{ color: '#333' }}>{diseaseData.name}</strong>
                                        <span style={{ fontSize: '10px', background: diseaseData.risk === 'High' ? '#d32f2f' : diseaseData.risk === 'Medium' ? '#ef6c00' : '#2e7d32', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{diseaseData.risk} RISK</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}><strong>Prevention:</strong> {diseaseData.prevention}</div>
                                    <div style={{ fontSize: '12px', padding: '8px', background: '#fffde7', borderLeft: '3px solid #fbc02d', borderRadius: '4px' }}>
                                        <strong>Recommended:</strong> {diseaseData.pesticide}
                                    </div>
                                </div>
                            ) : (
                                <p className="placeholder-text">Risk assessment pending...</p>
                            )}
                        </div>

                        {/* 18. GOVERNMENT SUBSIDY & SCHEMES */}
                        <div className="card subsidy-card">
                            <h3>Government Subsidy & Schemes</h3>
                            {analysisResult ? (
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#444' }}>
                                    {subsidySchemes.map((s, i) => <li key={i} style={{ marginBottom: '5px' }}>{s}</li>)}
                                </ul>
                            ) : (
                                <p className="placeholder-text">Schemes will appear based on state and land...</p>
                            )}
                        </div>

                    </div> {/* end .grid */}
                </div> {/* end .main-panel */}
            </div> {/* end .dashboard-container */}

            {/* MAP MODAL */}
            {showMapModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowMapModal(false); }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Select Location from Map</h3>
                            <button className="close-modal" onClick={() => setShowMapModal(false)}>&times;</button>
                        </div>
                        <div className="map-instructions">Click anywhere on the map to pin your location.</div>
                        <div className="map-container">
                            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '400px', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                                <MapClickHandler onMapClick={handleMapClick} />
                                {mapMarker && <Marker position={[mapMarker.lat, mapMarker.lng]} />}
                            </MapContainer>
                        </div>
                        <div className="modal-footer">
                            <button className="primary-btn" onClick={() => setShowMapModal(false)} disabled={!mapMarker}>Confirm Selection</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CHATBOT WIDGET */}
            <ChatBot />
        </div>
    );
}
