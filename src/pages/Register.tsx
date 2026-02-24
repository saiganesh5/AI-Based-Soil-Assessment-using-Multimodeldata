import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Register(): React.JSX.Element {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const [strength, setStrength] = useState<number>(0);
    const [strengthText, setStrengthText] = useState<string>('Password strength');

    const { signup } = useAuth();
    const navigate = useNavigate();

    function checkStrength(pass: string): void {
        let s = 0;
        if (pass.length > 5) s++;
        if (pass.length > 7) s++;
        if (/[A-Z]/.test(pass)) s++;
        if (/[0-9]/.test(pass)) s++;
        if (/[^A-Za-z0-9]/.test(pass)) s++;

        setStrength(s);
        if (s < 2) setStrengthText('Weak password');
        else if (s < 4) setStrengthText('Medium strength');
        else setStrengthText('Strong password');
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>): void {
        const val = e.target.value;
        setPassword(val);
        checkStrength(val);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, firstName, lastName, username);
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to create an account.');
        } finally {
            setLoading(false);
        }
    }

    const strengthColor = strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500';

    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500";

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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create Account</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Join us and start optimizing your soil health</p>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Username</label>
                            <input type="text" id="username" placeholder="Choose a unique username" required value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} className={inputClass} />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">First Name</label>
                                <input type="text" id="firstName" placeholder="John" required value={firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)} className={inputClass} />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Last Name</label>
                                <input type="text" id="lastName" placeholder="Doe" required value={lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)} className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <input type="email" id="email" placeholder="your.email@example.com" required value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} className={inputClass} />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} id="password" placeholder="Create a strong password" required value={password} onChange={handlePasswordChange} className={`${inputClass} pr-12`} />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 bg-transparent border-none cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="mt-2">
                                <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                    <div className={`h-full ${strengthColor} rounded-full transition-all duration-300`} style={{ width: `${(strength / 5) * 100}%` }}></div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-slate-400 mt-1 block">{strengthText}</span>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" placeholder="Re-enter your password" required value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} className={`${inputClass} pr-12`} />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 bg-transparent border-none cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input type="checkbox" name="terms" required className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 mt-0.5" />
                                <span className="text-sm text-gray-600 dark:text-slate-400">I agree to the <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:underline no-underline">Terms of Service</a> and <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:underline no-underline">Privacy Policy</a></span>
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500 dark:text-slate-400">Already have an account? <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline no-underline">Sign in</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
