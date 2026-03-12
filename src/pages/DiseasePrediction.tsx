import React, { useState } from 'react';
import { Upload, X, AlertCircle, Leaf, Loader2 } from 'lucide-react';

interface PredictionResult {
    disease: string;
    confidence?: number;
    recommendation?: string;
}

export default function DiseasePrediction(): React.JSX.Element {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    };

    const clearImage = () => {
        setSelectedImage(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setResult(null);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
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

            // Expecting the backend to return JSON with { disease: string, confidence?: number, recommendation?: string }
            const data: PredictionResult = await response.json();
            setResult(data);
        } catch (err: any) {
            console.error('Prediction error:', err);
            setError('Failed to get prediction. Please try again later or check if the complete backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                {/* Header section */}
                <div className="text-center mb-12 animate-fade-in">
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-4 text-emerald-600 dark:text-emerald-400">
                        <Leaf className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Crop Disease <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Prediction</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Upload an image of your crop's leaf to detect potential diseases instantly using our advanced AI model.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Upload Box */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all duration-300">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Upload Image</h2>
                            
                            {!previewUrl ? (
                                <div className="border-2 border-dashed border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-8 text-center hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors cursor-pointer group relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        id="image-upload"
                                    />
                                    <div className="flex flex-col items-center gap-4 text-emerald-600 dark:text-emerald-400">
                                        <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-full group-hover:scale-110 transition-transform duration-300">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-700 dark:text-slate-300">Click to upload</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-slate-400">SVG, PNG, JPG or GIF (max. 10MB)</p>
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
                                        className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors z-10"
                                        aria-label="Remove image"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
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
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2
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
                                    'Analyze Crop Health'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Results */}
                    <div className="flex flex-col gap-6">
                        {isLoading && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px] text-center animate-pulse">
                                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">AI is thinking...</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2">Analyzing leaf patterns for potential diseases</p>
                            </div>
                        )}

                        {!isLoading && !result && !error && (
                            <div className="bg-emerald-50/50 dark:bg-slate-900/50 rounded-3xl p-8 border border-emerald-100/50 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px] text-center">
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-emerald-400">
                                    <Leaf className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Upload to begin</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                    Our machine learning model will analyze the image and provide a disease prediction along with treatment recommendations.
                                </p>
                            </div>
                        )}

                        {!isLoading && result && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-emerald-200/20 dark:shadow-none border border-emerald-100 dark:border-emerald-900/30 animate-fade-in-up">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-full mb-6 relative">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Analysis Complete
                                </div>
                                
                                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Prediction</h3>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                                    {result.disease}
                                </div>

                                {result.confidence !== undefined && (
                                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                                            <span>Confidence Score</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{(result.confidence * 100).toFixed(1)}%</span>
                                        </h4>
                                        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                                style={{ width: `${result.confidence * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {result.recommendation && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                            <span>📋</span> Recommended Action
                                        </h4>
                                        <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                                {result.recommendation}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
