import { Link } from 'react-router-dom';

export default function About(): React.JSX.Element {
    return (
        <div>
            {/* PAGE HEADER */}
            <section className="py-20 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-center">
                <div className="container">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slideUp">About Our Platform</h1>
                    <p className="text-emerald-100/80 text-lg animate-slideUp">Revolutionizing agriculture through AI-powered soil analysis</p>
                </div>
            </section>

            {/* MISSION SECTION */}
            <section className="py-20 bg-white dark:bg-slate-800">
                <div className="container max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
                            <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-4">
                                We're on a mission to empower farmers with cutting-edge technology
                                to make informed, data-driven decisions about their land. By combining
                                artificial intelligence with agricultural expertise, we provide accurate
                                soil analysis and personalized recommendations that help farmers optimize
                                their yields while promoting sustainable farming practices.
                            </p>
                            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                                Our platform bridges the gap between modern technology and traditional
                                farming, making advanced soil analysis accessible to farmers of all scales.
                            </p>
                        </div>
                        <div className="card-glass p-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Why It Matters</h3>
                            <ul className="space-y-3">
                                {['🌾 Increase crop productivity by 30%', '💧 Reduce water and fertilizer waste', '🌍 Promote sustainable agriculture', '📊 Make data-driven farming decisions'].map((item, i) => (
                                    <li key={i} className="text-gray-700 dark:text-slate-300 text-sm">{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* TECHNOLOGY SECTION */}
            <section className="py-20 bg-gray-50 dark:bg-slate-900">
                <div className="container">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Technology</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How Our AI Works</h2>
                        <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Advanced machine learning models trained on thousands of soil samples
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { num: '01', title: 'Computer Vision', desc: 'Deep learning models analyze soil images to identify texture, color, and composition indicators.' },
                            { num: '02', title: 'Geospatial Data', desc: 'Integrates location-based climate patterns, rainfall data, and regional soil characteristics.' },
                            { num: '03', title: 'Predictive Analytics', desc: 'Machine learning algorithms predict crop suitability and fertilizer requirements with high accuracy.' },
                            { num: '04', title: 'Multi-Modal Fusion', desc: 'Combines image data, location information, and climate patterns for comprehensive analysis.' },
                        ].map((tech, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 hover:-translate-y-1 transition-all duration-300">
                                <div className="text-4xl font-bold text-emerald-200 dark:text-emerald-800 mb-3">{tech.num}</div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{tech.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{tech.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TEAM SECTION */}
            <section className="py-20 bg-white dark:bg-slate-800">
                <div className="container">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Our Team</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Built by Students, For Farmers</h2>
                        <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Final year engineering students passionate about solving real-world agricultural challenges
                        </p>
                    </div>

                    <div className="card-glass p-10 max-w-3xl mx-auto">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎓 Final Year Capstone Project</h3>
                        <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-8">
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

            {/* CTA SECTION */}
            <section className="py-20 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900">
                <div className="container">
                    <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-white/10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Analyze Your Soil?</h2>
                        <p className="text-emerald-100/80 mb-8">Join us in making farming smarter and more sustainable.</p>
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
