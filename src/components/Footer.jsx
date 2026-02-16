import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <div className="footer-logo">
                            <span className="logo-icon">🌱</span>
                            <span className="logo-text">AI Soil Health</span>
                        </div>
                        <p>Advanced AI-powered soil analysis for sustainable and profitable farming.</p>
                    </div>

                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><a href="#features">Features</a></li>
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Resources</h4>
                        <ul>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Connect</h4>
                        <p>Have questions? We'd love to hear from you.</p>
                        <Link to="/contact" className="btn btn-ghost btn-sm">Get in Touch</Link>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} AI Soil Health Assessment. Final Year Capstone Project.</p>
                </div>
            </div>
        </footer>
    );
}
