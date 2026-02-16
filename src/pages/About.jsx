import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="about-page">
            {/* PAGE HEADER */}
            <section className="page-header">
                <div className="container">
                    <h1 className="animate-slideUp">About Our Platform</h1>
                    <p className="animate-slideUp">Revolutionizing agriculture through AI-powered soil analysis</p>
                </div>
            </section>

            {/* MISSION SECTION */}
            <section className="content-section">
                <div className="container container-narrow">
                    <div className="content-grid">
                        <div className="content-col">
                            <h2>Our Mission</h2>
                            <p>
                                We're on a mission to empower farmers with cutting-edge technology
                                to make informed, data-driven decisions about their land. By combining
                                artificial intelligence with agricultural expertise, we provide accurate
                                soil analysis and personalized recommendations that help farmers optimize
                                their yields while promoting sustainable farming practices.
                            </p>
                            <p>
                                Our platform bridges the gap between modern technology and traditional
                                farming, making advanced soil analysis accessible to farmers of all scales.
                            </p>
                        </div>
                        <div className="content-col">
                            <div className="highlight-box card-glass">
                                <h3>Why It Matters</h3>
                                <ul className="check-list">
                                    <li>🌾 Increase crop productivity by 30%</li>
                                    <li>💧 Reduce water and fertilizer waste</li>
                                    <li>🌍 Promote sustainable agriculture</li>
                                    <li>📊 Make data-driven farming decisions</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TECHNOLOGY SECTION */}
            <section className="tech-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Technology</span>
                        <h2 className="section-title">How Our AI Works</h2>
                        <p className="section-description">
                            Advanced machine learning models trained on thousands of soil samples
                        </p>
                    </div>

                    <div className="tech-grid">
                        <div className="tech-card card">
                            <div className="tech-number">01</div>
                            <h3>Computer Vision</h3>
                            <p>
                                Deep learning models analyze soil images to identify texture,
                                color, and composition indicators.
                            </p>
                        </div>

                        <div className="tech-card card">
                            <div className="tech-number">02</div>
                            <h3>Geospatial Data</h3>
                            <p>
                                Integrates location-based climate patterns, rainfall data,
                                and regional soil characteristics.
                            </p>
                        </div>

                        <div className="tech-card card">
                            <div className="tech-number">03</div>
                            <h3>Predictive Analytics</h3>
                            <p>
                                Machine learning algorithms predict crop suitability and
                                fertilizer requirements with high accuracy.
                            </p>
                        </div>

                        <div className="tech-card card">
                            <div className="tech-number">04</div>
                            <h3>Multi-Modal Fusion</h3>
                            <p>
                                Combines image data, location information, and climate patterns
                                for comprehensive analysis.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TEAM SECTION */}
            <section className="team-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Our Team</span>
                        <h2 className="section-title">Built by Students, For Farmers</h2>
                        <p className="section-description">
                            Final year engineering students passionate about solving real-world agricultural challenges
                        </p>
                    </div>

                    <div className="team-info card-glass">
                        <div className="team-content">
                            <h3>🎓 Final Year Capstone Project</h3>
                            <p>
                                This platform is the result of extensive research, development, and testing
                                by a dedicated team of engineering students specializing in AI and machine learning.
                                We've collaborated with agricultural experts and farmers to ensure our solution
                                addresses real farming challenges.
                            </p>
                            <div className="project-highlights">
                                <div className="highlight-item">
                                    <strong>6+ Months</strong>
                                    <span>Development Time</span>
                                </div>
                                <div className="highlight-item">
                                    <strong>1000+</strong>
                                    <span>Soil Samples Analyzed</span>
                                </div>
                                <div className="highlight-item">
                                    <strong>95%</strong>
                                    <span>Model Accuracy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card card-glass">
                        <h2>Ready to Analyze Your Soil?</h2>
                        <p>Join us in making farming smarter and more sustainable.</p>
                        <div className="cta-actions">
                            <Link to="/dashboard" className="btn btn-primary btn-lg">Start Analysis</Link>
                            <Link to="/contact" className="btn btn-secondary btn-lg">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
