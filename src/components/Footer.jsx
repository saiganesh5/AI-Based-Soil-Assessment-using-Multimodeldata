import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-900 dark:bg-slate-950 text-gray-300 py-16 mt-auto">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🌱</span>
                            <span className="text-lg font-bold text-white">AI Soil Health</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">Advanced AI-powered soil analysis for sustainable and profitable farming.</p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
                        <ul className="space-y-2 list-none p-0 m-0">
                            <li><Link to="/" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors no-underline">Home</Link></li>
                            <li><a href="#features" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors no-underline">Features</a></li>
                            <li><Link to="/about" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors no-underline">About</Link></li>
                            <li><Link to="/contact" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors no-underline">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
                        <ul className="space-y-2 list-none p-0 m-0">
                            <li><Link to="/dashboard" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors no-underline">Dashboard</Link></li>
                            <li><Link to="/login" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors no-underline">Login</Link></li>
                            <li><Link to="/register" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors no-underline">Register</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Connect</h4>
                        <p className="text-sm text-gray-400 mb-4">Have questions? We'd love to hear from you.</p>
                        <Link to="/contact" className="btn btn-ghost btn-sm text-emerald-400 border border-emerald-700 hover:bg-emerald-900/30">Get in Touch</Link>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center">
                    <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} AI Soil Health Assessment. Final Year Capstone Project.</p>
                </div>
            </div>
        </footer>
    );
}
