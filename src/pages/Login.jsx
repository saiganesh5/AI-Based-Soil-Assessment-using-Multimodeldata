import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden p-6">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl animate-float-delayed"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 no-underline transition-colors">
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                <div className="card-glass p-8">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="text-3xl">🌱</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">AI Soil Health</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome Back</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Sign in to access your soil analysis dashboard</p>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email" id="email" placeholder="your.email@example.com" required
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"} id="password" placeholder="Enter your password" required
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all pr-12 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 bg-transparent border-none cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="remember" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                <span className="text-sm text-gray-600 dark:text-slate-400">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline no-underline">Forgot Password?</a>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500 dark:text-slate-400">Don't have an account? <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline no-underline">Sign up</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
