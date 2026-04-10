import React from 'react';
import { Link } from 'react-router-dom';

export default function Home(): React.JSX.Element {
    return (
        <div>
            {/* HERO SECTION */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900" id="home">
                {/* Animated Background Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-teal-500/15 rounded-full blur-3xl animate-float-delayed"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="container relative z-10">
                    <div className="max-w-3xl">
                        <div className="mb-6 animate-fadeIn">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-emerald-300 text-sm font-medium border border-white/10">
                                🚀 Powered by AI & Machine Learning
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-slideUp">
                            Transform Your Farmin with
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent"> AI-Powered Soil Analysis</span>
                        </h1>

                        <p className="text-lg text-emerald-100/80 leading-relaxed mb-8 max-w-2xl animate-slideUp">
                            Harness the power of artificial intelligence to analyze soil health,
                            get precise crop recommendations, and maximize your agricultural yield.
                            Make data-driven decisions for sustainable farming.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-12 animate-slideUp">
                            <Link to="/dashboard" className="btn btn-lg bg-white text-emerald-800 font-bold hover:bg-emerald-50 shadow-xl hover:shadow-2xl">
                                Start Analysis
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                            <a href="#how-it-works" className="btn btn-lg border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                                Learn More
                            </a>
                        </div>

                        <div className="flex gap-8 md:gap-12 animate-fadeIn">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">99</div>
                                <div className="text-xs text-emerald-300/70 uppercase tracking-wider mt-1">Accuracy Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">500</div>
                                <div className="text-xs text-emerald-300/70 uppercase tracking-wider mt-1">Analyses Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">50</div>
                                <div className="text-xs text-emerald-300/70 uppercase tracking-wider mt-1">Crop Types Supported</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="py-20 bg-gray-50 dark:bg-slate-900" id="features">
                <div className="container">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Features</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Comprehensive Soil Analysis Platform</h2>
                        <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Advanced AI technology meets agricultural expertise to deliver accurate,
                            actionable insights for your farmland.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: '📸', title: 'Image-Based Analysis', desc: 'Upload soil images for instant AI-powered analysis using computer vision and deep learning models.' },
                            { icon: '🌍', title: 'Location Intelligence', desc: 'Leverages geographical data and climate information for region-specific recommendations.' },
                            { icon: '🔬', title: 'Nutrient Detection', desc: 'Accurate measurement of N-P-K levels, pH balance, and moisture content for optimal growth.' },
                            { icon: '🌾', title: 'Crop Recommendations', desc: 'Get personalized crop suggestions based on soil type, climate, and seasonal patterns.' },
                            { icon: '💧', title: 'Fertilizer Guide', desc: 'Precise fertilizer recommendations with optimal quantities for maximum productivity.' },
                            { icon: '📊', title: 'Detailed Reports', desc: 'Comprehensive analysis reports with visual charts and actionable farming insights.' },
                        ].map((f, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 group">
                                <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">{f.icon}</div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{f.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section className="py-20 bg-white dark:bg-slate-800" id="how-it-works">
                <div className="container">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Process</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
                        <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Get started in three simple steps and transform your farming decisions.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
                        {[
                            { num: '1', icon: '📷', title: 'Upload Soil Image', desc: 'Capture and upload a clear photo of your soil sample using your smartphone or camera.' },
                            { num: '2', icon: '🤖', title: 'AI Analysis', desc: 'Our advanced AI models analyze soil composition, nutrients, and health parameters in real-time.' },
                            { num: '3', icon: '📈', title: 'Get Insights', desc: 'Receive detailed reports with crop recommendations, fertilizer guides, and farming tips.' },
                        ].map((step, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <div className="hidden md:block w-16 h-0.5 bg-gradient-to-r from-emerald-300 to-emerald-500 dark:from-emerald-600 dark:to-emerald-400"></div>}
                                <div className="relative bg-white dark:bg-slate-700 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-600 text-center max-w-xs">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">{step.num}</div>
                                    <div className="text-4xl mb-4 mt-2">{step.icon}</div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{step.desc}</p>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* BENEFITS SECTION */}
            <section className="py-20 bg-gray-50 dark:bg-slate-900">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Why Choose Us</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Smart Farming for Better Yields</h2>
                            <p className="text-gray-500 dark:text-slate-400 leading-relaxed mb-8">
                                Our AI-powered platform combines cutting-edge technology with agricultural
                                expertise to help farmers make informed decisions and achieve sustainable growth.
                            </p>

                            <ul className="space-y-4 mb-8">
                                {[
                                    'Increase crop yield by up to 30%',
                                    'Reduce fertilizer costs and waste',
                                    'Make data-driven farming decisions',
                                    'Promote sustainable agriculture practices',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-slate-300">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link to="/dashboard" className="btn btn-primary btn-lg">Start Your Analysis</Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                            {[
                                { icon: '🌱', title: 'Sustainable Farming', desc: 'Eco-friendly solutions for long-term soil health' },
                                { icon: '💰', title: 'Cost Effective', desc: 'Optimize resource usage and reduce expenses' },
                                { icon: '⚡', title: 'Instant Results', desc: 'Get analysis results in seconds, not days' },
                            ].map((card, i) => (
                                <div key={i} className={`card-glass p-6 hover:-translate-y-1 transition-transform duration-300 ${i === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                                    <div className="text-3xl mb-3">{card.icon}</div>
                                    <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">{card.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-20 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900">
                <div className="container">
                    <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-white/10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Farming?</h2>
                        <p className="text-emerald-100/80 mb-8 max-w-xl mx-auto">Join hundreds of farmers already using AI to maximize their harvest and profits.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/dashboard" className="btn btn-lg bg-white text-emerald-800 font-bold hover:bg-emerald-50 shadow-xl">Get Started Now</Link>
                            <Link to="/contact" className="btn btn-lg border-2 border-white/30 text-white hover:bg-white/10">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
