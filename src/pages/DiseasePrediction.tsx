import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Upload, X, AlertCircle, Leaf, Loader2, ArrowLeft,
    Home, LayoutDashboard, Cloud, User, LogOut,
    Camera, Sparkles, ShieldCheck, Info, Bug, Microscope
} from 'lucide-react';

interface PredictionResult {
    disease: string;
    confidence?: number;
    recommendation?: string;
}

export default function DiseasePrediction(): React.JSX.Element {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setSelectedImage(file);
                setPreviewUrl(URL.createObjectURL(file));
                setResult(null);
                setError(null);
            } else {
                setError('Please select a valid image file.');
            }
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        } else {
            setError('Please drop a valid image file.');
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const clearImage = useCallback(() => {
        setSelectedImage(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setResult(null);
        setError(null);
    }, [previewUrl]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedImage) {
            setError('Please select an image first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const response = await fetch('http://localhost:8080/predict-disease', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data: PredictionResult = await response.json();
            setResult(data);
        } catch (err: any) {
            console.error('Prediction error:', err);
            setError('Failed to get prediction. Please try again later or check if the complete backend is running.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedImage]);

    const handleLogout = useCallback(async () => {
        try { await logout(); navigate('/login'); }
        catch (err) { console.error('Logout failed:', err); }
    }, [logout, navigate]);

    const sideNavItems = [
        { icon: Home, label: 'Home', to: '/' },
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: Cloud, label: 'Weather', to: '/weather' },
        { icon: User, label: 'Profile', to: '/profile' },
    ];

    const howItWorks = [
        { icon: Camera, title: 'Upload Image', desc: 'Take a clear photo of the affected leaf and upload it.' },
        { icon: Microscope, title: 'AI Analysis', desc: 'Our deep learning model analyzes patterns and symptoms.' },
        { icon: ShieldCheck, title: 'Get Results', desc: 'Receive disease identification and treatment advice.' },
    ];

    const tips = [
        'Use clear, well-lit images for best results.',
        'Photograph the affected leaf close up.',
        'Include both healthy and affected areas.',
        'Avoid blurry or heavily shadowed images.',
        'A single leaf per image works best.',
    ];

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">

            {/* ═══════════ LEFT SIDEBAR ═══════════ */}
            <aside className="w-72 min-h-screen bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-r border-gray-200/60 dark:border-slate-700/60 flex flex-col fixed left-0 top-0 z-20">

                {/* Logo */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-700/50">
                    <Link to="/" className="flex items-center gap-3 no-underline">
                        <span className="text-3xl">🌱</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">AI Soil Health</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-1">
                    {sideNavItems.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all no-underline group"
                        >
                            <item.icon size={18} className="text-gray-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors" />
                            {item.label}
                        </Link>
                    ))}

                    {/* Active: Disease Prediction */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                        <Leaf size={18} />
                        Disease Prediction
                    </div>
                </nav>

                {/* Theme Toggle + Logout */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-700/50 space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all cursor-pointer bg-transparent border-none text-left"
                    >
                        <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer bg-transparent border-none text-left"
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* ═══════════ MAIN CONTENT AREA ═══════════ */}
            <main className="flex-1 ml-72">

                {/* ── Top Header Bar ── */}
                <header className="sticky top-0 z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors no-underline text-gray-400 dark:text-slate-500">
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Disease Prediction</h1>
                                <p className="text-xs text-gray-500 dark:text-slate-400">AI-powered crop disease detection</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                <Sparkles size={12} /> AI Powered
                            </span>
                        </div>
                    </div>
                </header>

                {/* ── Page Content ── */}
                <div className="p-8">

                    {/* ═══════ HERO BANNER ═══════ */}
                    <div className="relative rounded-2xl overflow-hidden mb-8">
                        <div className="h-44 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                            <div className="absolute inset-0 flex items-center justify-between px-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Crop Disease <span className="text-white/80">Prediction</span></h2>
                                    <p className="text-white/70 text-sm max-w-md">
                                        Upload an image of your crop's leaf to detect potential diseases instantly using our advanced deep learning model.
                                    </p>
                                </div>
                                <div className="text-white/15 text-7xl font-black select-none hidden lg:block">🍃</div>
                            </div>
                        </div>
                    </div>

                    {/* ═══════ HOW IT WORKS ═══════ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {howItWorks.map((step, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <step.icon size={22} className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{step.title}</h3>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ═══════ MAIN GRID: Upload + Results ═══════ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                        {/* ── Left Column: Upload Box ── */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Upload size={18} className="text-emerald-500" /> Upload Image
                                        </h2>
                                        {selectedImage && (
                                            <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                                                {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        )}
                                    </div>

                                    {!previewUrl ? (
                                        <div
                                            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group relative
                                                ${isDragOver
                                                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 scale-[1.01]'
                                                    : 'border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                                                }`}
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                id="image-upload"
                                            />
                                            <div className="flex flex-col items-center gap-4 text-emerald-600 dark:text-emerald-400">
                                                <div className="p-5 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                                    <Camera className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-base">
                                                        {isDragOver ? 'Drop your image here' : 'Click to upload or drag & drop'}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Supports PNG, JPG, GIF (max. 10MB)</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800 flex items-center justify-center min-h-[300px]">
                                            <img
                                                src={previewUrl}
                                                alt="Crop preview"
                                                className="max-h-[400px] w-auto object-contain z-0"
                                            />
                                            <button
                                                type="button"
                                                onClick={clearImage}
                                                className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors z-10 border-none cursor-pointer"
                                                aria-label="Remove image"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                                                <p className="text-white text-sm font-medium truncate">{selectedImage?.name}</p>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-900/50">
                                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <p className="text-sm">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!selectedImage || isLoading}
                                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 border-none cursor-pointer
                                            ${(!selectedImage || isLoading)
                                                ? 'bg-slate-300 dark:bg-slate-700 shadow-none cursor-not-allowed'
                                                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 hover:shadow-emerald-500/25 hover:-translate-y-1'
                                            }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Analyzing Image...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={18} />
                                                Analyze Crop Health
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Tips Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Info size={14} /> Photography Tips
                                </h3>
                                <ul className="space-y-3">
                                    {tips.map((tip, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-slate-400">
                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                                                ✓
                                            </span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* ── Right Column: Results ── */}
                        <div className="flex flex-col gap-6">

                            {/* Loading state */}
                            {isLoading && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700/50 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
                                    <div className="relative mb-6">
                                        <div className="w-20 h-20 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-500 rounded-full animate-spin"></div>
                                        <Microscope size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI is analyzing...</h3>
                                    <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">Examining leaf patterns for potential diseases</p>
                                    <div className="flex gap-1 mt-4">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            )}

                            {/* Empty state */}
                            {!isLoading && !result && !error && (
                                <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-8 border border-emerald-100/50 dark:border-slate-700/50 flex flex-col items-center justify-center min-h-[400px] text-center">
                                    <div className="w-24 h-24 bg-emerald-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 text-emerald-400 relative">
                                        <Leaf className="w-12 h-12" />
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-emerald-200 dark:border-slate-600">
                                            <Bug size={14} className="text-emerald-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Analyze</h3>
                                    <p className="text-gray-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
                                        Upload a clear photo of your crop's leaf. Our deep learning model will identify diseases and suggest treatments.
                                    </p>
                                    <div className="flex items-center gap-2 mt-6 text-xs text-gray-400 dark:text-slate-500">
                                        <ShieldCheck size={14} />
                                        <span>Your images are processed securely and not stored</span>
                                    </div>
                                </div>
                            )}

                            {/* Results */}
                            {!isLoading && result && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30 shadow-sm animate-fade-in-up">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-full mb-6 relative">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Analysis Complete
                                    </div>

                                    <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Disease Prediction</h3>
                                    <div className="text-3xl font-black text-gray-900 dark:text-white mb-6">
                                        {result.disease}
                                    </div>

                                    {result.confidence !== undefined && (
                                        <div className="mb-6 p-5 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-600/50">
                                            <h4 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <Sparkles size={14} className="text-emerald-500" />
                                                    Confidence Score
                                                </span>
                                                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{(result.confidence * 100).toFixed(1)}%</span>
                                            </h4>
                                            <div className="w-full h-3 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                                                    style={{ width: `${result.confidence * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-2 text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                                                <span>Low</span>
                                                <span>Medium</span>
                                                <span>High</span>
                                            </div>
                                        </div>
                                    )}

                                    {result.recommendation && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                                <ShieldCheck size={16} className="text-amber-500" />
                                                Recommended Action
                                            </h4>
                                            <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                                                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                                                    {result.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-slate-700/50">
                                        <button
                                            onClick={clearImage}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all font-medium bg-transparent cursor-pointer text-sm"
                                        >
                                            <Camera size={16} /> New Analysis
                                        </button>
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all cursor-pointer border-none text-sm"
                                        >
                                            <LayoutDashboard size={16} /> Go to Dashboard
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Supported Crops Info Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Leaf size={14} /> Supported Crops
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Rice', 'Wheat', 'Corn', 'Tomato', 'Potato', 'Cotton', 'Apple', 'Grape', 'Pepper', 'Citrus', 'Soybean', 'Sugarcane'].map(crop => (
                                        <span key={crop} className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-default">
                                            {crop}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-3 italic">
                                    The AI model is trained on 38+ disease categories across these crops.
                                </p>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                                    Quick Navigation
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link to="/" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/30 transition-all group no-underline">
                                        <Home size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                        <span className="text-xs font-medium text-gray-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Home</span>
                                    </Link>
                                    <Link to="/dashboard" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/30 transition-all group no-underline">
                                        <LayoutDashboard size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                        <span className="text-xs font-medium text-gray-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Dashboard</span>
                                    </Link>
                                    <Link to="/weather" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-transparent hover:border-sky-200 dark:hover:border-sky-800/30 transition-all group no-underline">
                                        <Cloud size={20} className="text-gray-400 group-hover:text-sky-500 transition-colors" />
                                        <span className="text-xs font-medium text-gray-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400">Weather</span>
                                    </Link>
                                    <Link to="/profile" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-violet-50 dark:hover:bg-violet-900/20 border border-transparent hover:border-violet-200 dark:hover:border-violet-800/30 transition-all group no-underline">
                                        <User size={20} className="text-gray-400 group-hover:text-violet-500 transition-colors" />
                                        <span className="text-xs font-medium text-gray-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400">Profile</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
