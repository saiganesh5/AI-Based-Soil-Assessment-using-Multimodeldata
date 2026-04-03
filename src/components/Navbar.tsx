import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar(): React.JSX.Element {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const toggleMenu = (): void => setIsMenuOpen(!isMenuOpen);

    const isHomePage = location.pathname === '/';

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 transition-colors duration-300" id="navbar">
            <div className="container">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 no-underline">
                        <span className="text-2xl">🌱</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">AI Soil Health</span>
                    </Link>

                    <div className={`md:flex items-center gap-6 ${isMenuOpen ? 'flex flex-col absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-4 shadow-lg z-50' : 'hidden'}`} id="navMenu">
                        <Link to="/" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors no-underline">Home</Link>
                        {isHomePage ? (
                            <>
                                <a href="#features" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors no-underline">Features</a>
                                <a href="#how-it-works" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors no-underline">How It Works</a>
                            </>
                        ) : (
                            <>
                                <Link to="/#features" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors no-underline">Features</Link>
                                <Link to="/#how-it-works" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors no-underline">How It Works</Link>
                            </>
                        )}
                        <Link to="/about" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors no-underline">About</Link>
                        <Link to="/contact" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors no-underline">Contact</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            className="p-2 rounded-full text-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-300 hover:rotate-12 hover:scale-110 cursor-pointer border-none bg-transparent"
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
                                <Link to="/weather" className="btn btn-ghost btn-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"> Weather</Link>
                                <Link to="/predict-disease" className="btn btn-ghost btn-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">🌿 Disease</Link>
                                <Link to="/profile" className="btn btn-ghost btn-sm text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20">👤 Profile</Link>
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
                        className="md:hidden flex flex-col gap-1 p-2 bg-transparent border-none cursor-pointer text-gray-600 dark:text-slate-300"
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
