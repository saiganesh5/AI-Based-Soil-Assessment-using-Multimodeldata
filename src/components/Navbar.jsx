import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const isHomePage = location.pathname === '/';

    return (
        <nav className="navbar" id="navbar">
            <div className="container">
                <div className="nav-content">
                    <Link to="/" className="logo">
                        <span className="logo-icon">🌱</span>
                        <span className="logo-text">AI Soil Health</span>
                    </Link>

                    <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`} id="navMenu">
                        <Link to="/" className="nav-link">Home</Link>
                        {isHomePage ? (
                            <>
                                <a href="#features" className="nav-link">Features</a>
                                <a href="#how-it-works" className="nav-link">How It Works</a>
                            </>
                        ) : (
                            <>
                                <Link to="/#features" className="nav-link">Features</Link>
                                <Link to="/#how-it-works" className="nav-link">How It Works</Link>
                            </>
                        )}
                        <Link to="/about" className="nav-link">About</Link>
                        <Link to="/contact" className="nav-link">Contact</Link>
                    </div>

                    <div className="nav-actions">
                        <button
                            className="btn btn-ghost btn-sm theme-toggle"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            id="themeToggle"
                            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        {currentUser ? (
                            <>
                                <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
                                <button onClick={logout} className="btn btn-ghost btn-sm">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                            </>
                        )}
                    </div>

                    <button
                        className="mobile-menu-toggle"
                        id="mobileMenuToggle"
                        aria-label="Toggle menu"
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>
        </nav>
    );
}
