import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div>
            {/* HERO SECTION */}
            <section className="hero" id="home">
                <div className="hero-background"></div>
                <div className="hero-overlay"></div>

                {/* Animated Background Elements */}
                <div className="hero-decorations">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                    <div className="orb orb-3"></div>
                </div>

                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge animate-fadeIn">
                            <span className="badge badge-primary">🚀 Powered by AI & Machine Learning</span>
                        </div>

                        <h1 className="hero-title animate-slideUp">
                            Transform Your Farming with
                            <span className="text-gradient"> AI-Powered Soil Analysis</span>
                        </h1>

                        <p className="hero-description animate-slideUp">
                            Harness the power of artificial intelligence to analyze soil health,
                            get precise crop recommendations, and maximize your agricultural yield.
                            Make data-driven decisions for sustainable farming.
                        </p>

                        <div className="hero-cta animate-slideUp">
                            <Link to="/dashboard" className="btn btn-primary btn-lg">
                                Start Analysis
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                            <a href="#how-it-works" className="btn btn-secondary btn-lg">
                                Learn More
                            </a>
                        </div>

                        <div className="hero-stats animate-fadeIn">
                            <div className="stat-item">
                                <div className="stat-value" data-target="99">99</div>
                                <div className="stat-label">Accuracy Rate</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value" data-target="500">500</div>
                                <div className="stat-label">Analyses Completed</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value" data-target="50">50</div>
                                <div className="stat-label">Crop Types Supported</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="features" id="features">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Features</span>
                        <h2 className="section-title">Comprehensive Soil Analysis Platform</h2>
                        <p className="section-description">
                            Advanced AI technology meets agricultural expertise to deliver accurate,
                            actionable insights for your farmland.
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📸</div>
                            <h3>Image-Based Analysis</h3>
                            <p>Upload soil images for instant AI-powered analysis using computer vision and deep learning models.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🌍</div>
                            <h3>Location Intelligence</h3>
                            <p>Leverages geographical data and climate information for region-specific recommendations.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔬</div>
                            <h3>Nutrient Detection</h3>
                            <p>Accurate measurement of N-P-K levels, pH balance, and moisture content for optimal growth.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🌾</div>
                            <h3>Crop Recommendations</h3>
                            <p>Get personalized crop suggestions based on soil type, climate, and seasonal patterns.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">💧</div>
                            <h3>Fertilizer Guide</h3>
                            <p>Precise fertilizer recommendations with optimal quantities for maximum productivity.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Detailed Reports</h3>
                            <p>Comprehensive analysis reports with visual charts and actionable farming insights.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section className="how-it-works" id="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Process</span>
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-description">
                            Get started in three simple steps and transform your farming decisions.
                        </p>
                    </div>

                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <div className="step-icon">📷</div>
                                <h3>Upload Soil Image</h3>
                                <p>Capture and upload a clear photo of your soil sample using your smartphone or camera.</p>
                            </div>
                        </div>

                        <div className="step-connector"></div>

                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <div className="step-icon">🤖</div>
                                <h3>AI Analysis</h3>
                                <p>Our advanced AI models analyze soil composition, nutrients, and health parameters in real-time.</p>
                            </div>
                        </div>

                        <div className="step-connector"></div>

                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <div className="step-icon">📈</div>
                                <h3>Get Insights</h3>
                                <p>Receive detailed reports with crop recommendations, fertilizer guides, and farming tips.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BENEFITS SECTION */}
            <section className="benefits">
                <div className="container">
                    <div className="benefits-grid">
                        <div className="benefits-content">
                            <span className="section-label">Why Choose Us</span>
                            <h2>Smart Farming for Better Yields</h2>
                            <p>
                                Our AI-powered platform combines cutting-edge technology with agricultural
                                expertise to help farmers make informed decisions and achieve sustainable growth.
                            </p>

                            <ul className="benefits-list">
                                <li>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>Increase crop yield by up to 30%</span>
                                </li>
                                <li>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>Reduce fertilizer costs and waste</span>
                                </li>
                                <li>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>Make data-driven farming decisions</span>
                                </li>
                                <li>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>Promote sustainable agriculture practices</span>
                                </li>
                            </ul>

                            <Link to="/dashboard" className="btn btn-primary">Start Your Analysis</Link>
                        </div>

                        <div className="benefits-visual">
                            <div className="visual-card card-glass">
                                <div className="visual-icon">🌱</div>
                                <h4>Sustainable Farming</h4>
                                <p>Eco-friendly solutions for long-term soil health</p>
                            </div>
                            <div className="visual-card card-glass">
                                <div className="visual-icon">💰</div>
                                <h4>Cost Effective</h4>
                                <p>Optimize resource usage and reduce expenses</p>
                            </div>
                            <div className="visual-card card-glass">
                                <div className="visual-icon">⚡</div>
                                <h4>Instant Results</h4>
                                <p>Get analysis results in seconds, not days</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card card-glass">
                        <h2>Ready to Transform Your Farming?</h2>
                        <p>Join hundreds of farmers already using AI to maximize their harvest and profits.</p>
                        <div className="cta-actions">
                            <Link to="/dashboard" className="btn btn-primary btn-lg">Get Started Now</Link>
                            <Link to="/contact" className="btn btn-secondary btn-lg">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
