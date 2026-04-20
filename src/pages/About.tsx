import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/* =============================================
   ACCORDION COMPONENT — reusable collapsible
   ============================================= */
interface AccordionProps {
    title: string;
    icon: string;
    badge?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function Accordion({ title, icon, badge, children, defaultOpen = false }: AccordionProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`border rounded-2xl transition-all duration-300 overflow-hidden ${isOpen
            ? 'border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-500/5'
            : 'border-gray-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800'
            }`}>
            <button
                className="w-full flex items-center justify-between px-6 py-5 bg-white dark:bg-slate-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors cursor-pointer border-none text-left group"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
                    <span className="text-base font-bold text-gray-900 dark:text-white">{title}</span>
                    {badge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            {badge}
                        </span>
                    )}
                </div>
                <svg
                    className={`w-5 h-5 text-gray-400 dark:text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`transition-all duration-400 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                style={{ overflow: 'hidden' }}
            >
                <div className="px-6 pb-6 pt-2 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700/50">
                    {children}
                </div>
            </div>
        </div>
    );
}

/* =============================================
   FEATURE PILL — inline highlight
   ============================================= */
function Pill({ children }: { children: React.ReactNode }): React.JSX.Element {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            {children}
        </span>
    );
}

/* =============================================
   TEAM MEMBER DATA
   ============================================= */
const teamMembers = [
    {
        name: 'Sai Ganesh',
        role: 'Full-Stack Developer & ML Engineer',
        image: '/team/ganesh.jpg',
        github: 'https://github.com/saiganesh5',
        contributions: ['System Architecture', 'Soil Classification Model', 'Dashboard Development', 'API Design'],
        bio: 'Led the overall system architecture and developed the core soil classification model using MobileNetV2. Built the full-stack pipeline from data collection to deployment.',
    },
    {
        name: 'Sai Chandu',
        role: 'Frontend Developer & UI/UX Designer',
        image: '/team/saichandu.jpg',
        github: 'https://github.com/saichandueerpina',
        contributions: ['UI/UX Design', 'Weather Module', 'Responsive Layout', 'Theme System'],
        bio: 'Designed the premium UI/UX of the platform with dark mode support, interactive components, and built the weather intelligence module with real-time data visualization.',
    },
    {
        name: 'Mani Karthik',
        role: 'ML Engineer & Backend Developer',
        image: '/team/manikarthik.jpg',
        github: 'https://github.com/manikarthik03',
        contributions: ['Disease Prediction Model', 'Data Pipeline', 'Backend APIs', 'Model Training'],
        bio: 'Developed the crop disease prediction model using EfficientNetV2, trained on 38+ disease categories. Built the backend data pipeline and API infrastructure.',
    },
];

/* =============================================
   ARCHITECTURE FLOW ITEMS
   ============================================= */
const architectureSteps = [
    { num: '01', label: 'User Input', desc: 'Soil image + location + climate parameters', icon: '📥' },
    { num: '02', label: 'AI Processing', desc: 'MobileNetV2 classifies soil type from the image', icon: '🧠' },
    { num: '03', label: 'Data Fusion', desc: 'Merges image data with geospatial & climate intelligence', icon: '🔗' },
    { num: '04', label: 'Analysis Engine', desc: 'Computes NPK levels, pH, moisture, and health score', icon: '⚙️' },
    { num: '05', label: 'Recommendation', desc: 'Generates crop, fertilizer, irrigation & financial insights', icon: '📊' },
    { num: '06', label: 'Dashboard', desc: 'Interactive cards with charts, timelines & advisories', icon: '🖥️' },
];

/* =============================================
   TECH STACK
   ============================================= */
const techStack = [
    { category: 'Frontend', items: ['React 18 + TypeScript', 'Tailwind CSS', 'Chart.js', 'Leaflet Maps', 'Lucide Icons', 'Vite'] },
    { category: 'Backend', items: ['Python Flask', 'Flask-CORS', 'REST APIs', 'Scikit-learn'] },
    { category: 'AI / ML', items: ['TensorFlow / Keras', 'MobileNetV2 (Soil)', 'EfficientNetV2 (Disease)', 'Transfer Learning'] },
    { category: 'Services', items: ['Firebase Auth', 'Google Gemini API', 'OpenWeatherMap', 'Open-Meteo', 'Nominatim Geocoding'] },
    { category: 'DevOps', items: ['AWS Elastic Beanstalk', 'CloudFront CDN', 'GitHub Actions', 'Vite Build'] },
];

/* =============================================
   ABOUT PAGE COMPONENT
   ============================================= */
export default function About(): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<'modules' | 'architecture' | 'tech'>('modules');

    return (
        <div>
            {/* ═══════════ HERO HEADER ═══════════ */}
            <section className="relative py-24 overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-center">
                {/* Animated Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-[15%] w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-10 right-[10%] w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-float-delayed"></div>
                </div>

                <div className="container relative z-10">
                    <div className="mb-4 animate-fadeIn">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-emerald-300 text-xs font-bold uppercase tracking-widest border border-white/10">
                            📖 Documentation & Team
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-slideUp">
                        About Our{' '}
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                            Platform
                        </span>
                    </h1>
                    <p className="text-emerald-100/80 text-lg max-w-2xl mx-auto animate-slideUp">
                        An in-depth look at how every module works, the technology behind it, and the team that built it.
                    </p>
                </div>
            </section>

            {/* ═══════════ MISSION SECTION ═══════════ */}
            <section className="py-20 bg-white dark:bg-slate-800">
                <div className="container max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <div>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                                Our Mission
                            </span>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                Empowering Farmers with AI-Driven Intelligence
                            </h2>
                            <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-4">
                                We set out to bridge the gap between cutting-edge AI technology and everyday farming decisions.
                                Indian agriculture supports over 600 million livelihoods, yet most farmers still rely on
                                manual soil testing or costly laboratory analysis. Our platform turns a simple soil photograph
                                into comprehensive, actionable intelligence — for free.
                            </p>
                            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                                The system combines <strong>computer vision</strong>, <strong>geospatial data</strong>, and
                                <strong> predictive analytics</strong> into a single, intuitive dashboard that helps farmers
                                understand their soil, choose the right crops, optimize fertilizer usage, and maximize returns.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { icon: '🌾', stat: '12', label: 'Soil Types Classified', detail: 'Alluvial, Black, Red, Laterite, Desert, Forest, Peaty, Sandy, Clay, Silt, Loamy, Chalky' },
                                { icon: '🌿', stat: '38+', label: 'Disease Categories', detail: 'Deep learning model trained to identify crop diseases across multiple species' },
                                { icon: '📊', stat: '18', label: 'Dashboard Widgets', detail: 'NPK, pH, moisture, crops, fertilizers, yield, profit, schedules, and more' },
                                { icon: '🤖', stat: '24/7', label: 'AI Chatbot Assistant', detail: 'Multilingual SoilBot powered by Google Gemini for instant farming advice' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors group">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">{item.icon}</div>
                                    <div>
                                        <div className="flex items-baseline gap-2 mb-0.5">
                                            <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">{item.stat}</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ TABBED DOCUMENTATION ═══════════ */}
            <section className="py-20 bg-gray-50 dark:bg-slate-900">
                <div className="container max-w-5xl">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                            How It Works
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Platform Documentation
                        </h2>
                        <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Explore every module, understand the system architecture, and discover the technology stack powering this platform.
                        </p>
                    </div>

                    {/* Tab Pills */}
                    <div className="flex justify-center gap-2 mb-10 flex-wrap">
                        {[
                            { key: 'modules' as const, label: 'Modules', icon: '📦' },
                            { key: 'architecture' as const, label: 'Architecture', icon: '🏗️' },
                            { key: 'tech' as const, label: 'Tech Stack', icon: '⚡' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer border-none ${activeTab === tab.key
                                    ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/25'
                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-gray-200 dark:border-slate-700'
                                    }`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <span className="mr-1.5">{tab.icon}</span>{tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── TAB: MODULES ── */}
                    {activeTab === 'modules' && (
                        <div className="space-y-4 animate-fadeIn">

                            {/* Module 1: Soil Analysis Dashboard */}
                            <Accordion title="Soil Analysis Dashboard" icon="🧪" badge="Core Module" defaultOpen={true}>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                                        The Dashboard is the command center of the platform. It collects user inputs, triggers AI analysis,
                                        and renders results across <strong>18 interactive cards</strong> — from soil classification to profit estimation.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">📸 Image Upload</div>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">Users upload a soil photograph. The image is sent to the Flask backend where a <Pill>MobileNetV2</Pill> deep learning model classifies the soil type from 12 categories.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">📍 Location Selection</div>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">Choose an Indian state & district from the dropdown, or pin your exact location on an interactive <Pill>Leaflet</Pill> map. The system uses <Pill>Nominatim reverse geocoding</Pill> to resolve coordinates.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">🔬 Soil Parameters</div>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">Post-analysis, the dashboard displays pH level, moisture percentage, and N-P-K (Nitrogen, Phosphorus, Potassium) values in mg/kg extracted from the analysis engine.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">📊 Soil Classification Gauge</div>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">A <Pill>Chart.js doughnut gauge</Pill> visualizes the detected soil type against all 12 Indian soil categories with color-coded indicators and match confidence.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/30">
                                            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">🌾 Crop Recommendations</div>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400">Recommends suitable crops for the detected soil. Click any crop to see detailed growth insights, fertilizer schedules, and profit projections.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/30">
                                            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">💰 Fertilizer & Cost</div>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400">Calculates fertilizer quantities per acre, displays per-bag costs at market rates, and shows a total estimated investment amount.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/30">
                                            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">📈 Yield & Profit</div>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400">Predicts expected yield in quintals and calculates net profit by comparing estimated revenue against fertilizer investment.</p>
                                        </div>
                                    </div>
                                </div>
                            </Accordion>

                            {/* Module 2: Soil Intelligence Engine */}
                            <Accordion title="Soil Intelligence Engine" icon="🧠" badge="AI Core">
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                                        The intelligence engine sits behind the dashboard and processes multi-modal data to generate comprehensive soil insights.
                                    </p>
                                    <div className="space-y-3">
                                        {[
                                            { title: 'Soil Health Score', desc: 'Computes a 0–100 health score based on the soil type. Scores are categorized as Excellent (90+), Healthy (75+), Moderate (60+), Poor (40+), or Critical. A visual progress bar reflects the result.', color: 'text-green-600 dark:text-green-400' },
                                            { title: 'State-Soil Mapping', desc: 'Cross-references the selected Indian state with a database of typical soil types to validate the AI classification and highlight regional soil patterns.', color: 'text-blue-600 dark:text-blue-400' },
                                            { title: 'Seasonal Crop Planner', desc: 'Provides season-specific crop suggestions (Kharif, Rabi, Zaid). Highlights crops that match both the detected soil type and the selected season with star indicators.', color: 'text-amber-600 dark:text-amber-400' },
                                            { title: 'Crop Rotation Advisor', desc: 'Recommends subsequent crops based on previously grown crops to maintain soil health. Explains the agricultural benefit (e.g., nitrogen fixation, pest control).', color: 'text-purple-600 dark:text-purple-400' },
                                            { title: 'Irrigation Planning', desc: 'Shows water requirements (mm), recommended irrigation method (drip, sprinkler, flood), and frequency schedule for the selected crop.', color: 'text-sky-600 dark:text-sky-400' },
                                            { title: 'Disease Risk Assessment', desc: 'Flags common diseases for the selected crop, assigns risk levels (Low/Medium/High), and recommends preventive measures and specific pesticides.', color: 'text-red-600 dark:text-red-400' },
                                            { title: 'Government Schemes', desc: 'Displays state-specific agricultural subsidies and central government schemes relevant to the farmer\'s location and crop selection.', color: 'text-emerald-600 dark:text-emerald-400' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                                                <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-current ${item.color}`}></div>
                                                <div>
                                                    <div className={`text-sm font-bold ${item.color}`}>{item.title}</div>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mt-0.5">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Accordion>

                            {/* Module 3: Weather Intelligence */}
                            <Accordion title="Weather Intelligence Module" icon="🌦️">
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                                        A dedicated weather page that gives farmers real-time and forecasted weather data tailored to their specific location, complete with agricultural advisories.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/15 border border-sky-200 dark:border-sky-800/30">
                                            <div className="text-xs font-bold text-sky-700 dark:text-sky-400 mb-1">🔍 Location Search</div>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400">Debounced search with autocomplete via <Pill>Nominatim API</Pill>. Also supports browser geolocation and quick-select pills for major Indian cities.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/15 border border-sky-200 dark:border-sky-800/30">
                                            <div className="text-xs font-bold text-sky-700 dark:text-sky-400 mb-1">🗺️ Interactive Map</div>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400">Toggleable <Pill>Leaflet</Pill> map with auto-pan animations. Click any point to load weather data for that location instantly.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/15 border border-sky-200 dark:border-sky-800/30">
                                            <div className="text-xs font-bold text-sky-700 dark:text-sky-400 mb-1">📈 Weather Dashboard</div>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400">Rich bento-grid layout showing current temperature, humidity, wind speed, UV index, pressure, sunrise/sunset, and 7-day forecast with min/max ranges.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/15 border border-sky-200 dark:border-sky-800/30">
                                            <div className="text-xs font-bold text-sky-700 dark:text-sky-400 mb-1">🌾 Agricultural Advisory</div>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400">Generates farming-specific weather advisories — irrigation recommendations, frost warnings, ideal sowing windows — based on the forecast data.</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 italic">
                                        Data sourced from <Pill>Open-Meteo</Pill> (forecast) and <Pill>OpenWeatherMap</Pill> (current conditions) APIs. No API key required for Open-Meteo.
                                    </p>
                                </div>
                            </Accordion>

                            {/* Module 4: Disease Prediction */}
                            <Accordion title="Crop Disease Prediction" icon="🌿">
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                                        An AI-powered leaf disease detection module. Farmers upload a photograph of a crop's leaf, and a deep learning model identifies potential diseases with confidence scores.
                                    </p>
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/15 dark:to-teal-900/15 border border-emerald-200 dark:border-emerald-800/30">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white mb-3">How It Works</div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {[
                                                { step: '1', title: 'Upload', desc: 'Drag-and-drop or click to upload a clear leaf image (PNG/JPG/GIF, max 10MB).' },
                                                { step: '2', title: 'AI Analysis', desc: 'Image is sent to a deep learning model (EfficientNetV2) hosted on AWS CloudFront.' },
                                                { step: '3', title: 'Results', desc: 'Returns top-5 predictions with confidence percentages and treatment suggestions.' },
                                            ].map((s) => (
                                                <div key={s.step} className="flex-1 flex items-start gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</span>
                                                    <div>
                                                        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{s.title}</div>
                                                        <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {['Rice', 'Wheat', 'Corn', 'Tomato', 'Potato', 'Cotton', 'Apple', 'Grape'].map(crop => (
                                            <div key={crop} className="text-center px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-xs font-medium text-gray-700 dark:text-slate-300">{crop}</div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 italic">
                                        Model trained on 38+ disease categories. Supports 12+ crop species. Served via <Pill>AWS CloudFront CDN</Pill> for low-latency predictions.
                                    </p>
                                </div>
                            </Accordion>

                            {/* Module 5: SoilBot AI Chatbot */}
                            <Accordion title="SoilBot — AI Chatbot Assistant" icon="🤖">
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                                        SoilBot is a multilingual AI chatbot available on every authenticated page. It helps farmers ask questions about soil, crops, fertilizers, government schemes, and more — in their preferred language.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">💬 Conversational AI</div>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">Powered by <Pill>Google Gemini API</Pill> (gemini-3-flash-preview model). Maintains full conversation history for contextual, multi-turn dialogues.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">🌍 Multilingual Support</div>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">Greets users in Hindi, Telugu, and English. Responds in the language the farmer uses — breaking down language barriers in precision agriculture.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">🎯 Agriculture Focused</div>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">System prompt constrains SoilBot to agricultural topics — soil types, N-P-K, crop schedules, subsidies, irrigation, and disease prevention.</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">✨ Floating Widget</div>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">Accessible via a pulsing FAB (Floating Action Button). Opens a sleek chat window with typing indicators, avatars, and smooth animations.</p>
                                        </div>
                                    </div>
                                </div>
                            </Accordion>

                            {/* Module 6: Authentication & Profile */}
                            <Accordion title="Authentication & User Profile" icon="🔐">
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                                        Secure authentication powered by <Pill>Firebase Auth</Pill> with email/password registration, login, and password recovery flows.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { icon: '📝', title: 'Registration', desc: 'Full signup with name, email, password, and re-type password with real-time validation.' },
                                            { icon: '🔑', title: 'Login', desc: 'Secure login with email & password. Protected routes redirect unauthenticated users.' },
                                            { icon: '🔄', title: 'Password Reset', desc: 'Forgot password flow sends a reset link via Firebase. OTP-style verification.' },
                                        ].map((item, i) => (
                                            <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-center">
                                                <div className="text-2xl mb-2">{item.icon}</div>
                                                <div className="text-xs font-bold text-gray-900 dark:text-white mb-1">{item.title}</div>
                                                <p className="text-[11px] text-gray-500 dark:text-slate-400">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Accordion>

                            {/* Module 7: Guided Tour System */}
                            <Accordion title="Interactive Guided Tour" icon="🎯">
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                                        A custom-built, per-page tour system that highlights key UI elements for first-time visitors.
                                        Uses a spotlight overlay with step-by-step instructions stored in a <Pill>TourContext</Pill> provider.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Home Page', 'Dashboard', 'Weather', 'Disease Prediction'].map(page => (
                                            <span key={page} className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                                ✅ {page}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                                        The tour system tracks completion per-user via localStorage. Users can replay tours anytime via the <strong>"?"</strong> button available on every protected page.
                                    </p>
                                </div>
                            </Accordion>
                        </div>
                    )}

                    {/* ── TAB: ARCHITECTURE ── */}
                    {activeTab === 'architecture' && (
                        <div className="animate-fadeIn">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                {architectureSteps.map((step) => (
                                    <div key={step.num} className="relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 hover:-translate-y-1 transition-all duration-300 group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white text-xs font-bold flex items-center justify-center shadow-md">{step.num}</span>
                                            <span className="text-2xl group-hover:scale-110 transition-transform">{step.icon}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{step.label}</h4>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Data Flow */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📐 System Architecture</h3>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/30">
                                        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Frontend (Client)</div>
                                        <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                                            React 18 with TypeScript, built with Vite. Uses React Router for SPA navigation.
                                            State management via React Context (AuthContext, ThemeContext, TourContext).
                                            Tailwind CSS for styling with dark mode toggle. Chart.js for data visualization. Leaflet for interactive maps.
                                        </p>
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="w-0.5 h-8 bg-emerald-300 dark:bg-emerald-700"></div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-900/15 border border-sky-200 dark:border-sky-800/30">
                                        <div className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider mb-2">Backend (Server)</div>
                                        <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                                            Python Flask REST API with CORS enabled. Handles <code>/analyze</code> endpoint for soil analysis.
                                            Loads TensorFlow/Keras models for soil classification. Scikit-learn for fertilizer recommendation model (PKL).
                                            Deployed on AWS Elastic Beanstalk.
                                        </p>
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="w-0.5 h-8 bg-sky-300 dark:bg-sky-700"></div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/15 border border-purple-200 dark:border-purple-800/30">
                                        <div className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-2">External Services</div>
                                        <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                                            Firebase for authentication. Google Gemini for the SoilBot chatbot. Open-Meteo & OpenWeatherMap for weather data.
                                            Nominatim for geocoding. AWS CloudFront for serving the disease prediction model.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB: TECH STACK ── */}
                    {activeTab === 'tech' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
                            {techStack.map((group) => (
                                <div key={group.category} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:-translate-y-0.5 transition-all duration-300">
                                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">{group.category}</div>
                                    <div className="space-y-2">
                                        {group.items.map((item) => (
                                            <div key={item} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════ TEAM SECTION ═══════════ */}
            <section className="py-20 bg-white dark:bg-slate-800">
                <div className="container max-w-5xl">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                            Meet the Team
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Built by Students, For Farmers
                        </h2>
                        <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Final year engineering students passionate about solving real-world agricultural challenges through AI and modern web technologies.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {teamMembers.map((member) => (
                            <div
                                key={member.name}
                                className="relative bg-white dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10"
                            >
                                {/* Profile Image */}
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-lg font-bold text-white mb-0.5">{member.name}</h3>
                                        <p className="text-emerald-300 text-xs font-medium">{member.role}</p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-4">
                                        {member.bio}
                                    </p>

                                    {/* Contributions */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {member.contributions.map((c) => (
                                            <span key={c} className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
                                                {c}
                                            </span>
                                        ))}
                                    </div>

                                    {/* GitHub Link */}
                                    <a
                                        href={member.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-slate-600 text-white text-xs font-semibold hover:bg-gray-800 dark:hover:bg-slate-500 transition-all no-underline group/link w-full justify-center"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        View GitHub Profile
                                        <svg className="w-3 h-3 opacity-50 group-hover/link:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Project Stats */}
                    <div className="mt-16 card-glass p-10 max-w-3xl mx-auto">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">🎓 Final Year Capstone Project</h3>
                        <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-8 text-center text-sm">
                            This platform is the result of extensive research, development, and testing
                            by a dedicated team of engineering students specializing in AI and machine learning.
                            We've collaborated with agricultural experts and farmers to ensure our solution
                            addresses real farming challenges.
                        </p>
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { value: '6+ Months', label: 'Development Time' },
                                { value: '1000+', label: 'Soil Samples Analyzed' },
                                { value: '95%', label: 'Model Accuracy' },
                            ].map((h, i) => (
                                <div key={i} className="text-center bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                                    <strong className="block text-xl text-emerald-700 dark:text-emerald-400 font-bold">{h.value}</strong>
                                    <span className="text-xs text-gray-500 dark:text-slate-400">{h.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA SECTION ═══════════ */}
            <section className="py-20 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900">
                <div className="container">
                    <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-white/10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Analyze Your Soil?</h2>
                        <p className="text-emerald-100/80 mb-8 max-w-xl mx-auto">Join us in making farming smarter and more sustainable with AI-powered intelligence.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/dashboard" className="btn btn-lg bg-white text-emerald-800 font-bold hover:bg-emerald-50 shadow-xl">Start Analysis</Link>
                            <Link to="/contact" className="btn btn-lg border-2 border-white/30 text-white hover:bg-white/10">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
