import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowLeft, ArrowRight, Mail, ShieldCheck, Loader2 } from 'lucide-react';

const API_BASE = 'http://soilhealthassessment.ap-south-1.elasticbeanstalk.com:5000';

export default function Register(): React.JSX.Element {
    // ── Step state (1 → 2 → 3) ──
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // ── Form fields ──
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

    // ── Password strength ──
    const [strength, setStrength] = useState<number>(0);
    const [strengthText, setStrengthText] = useState<string>('Password strength');

    // ── Username availability ──
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Email availability ──
    const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error' | 'invalid'>('idle');
    const emailDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── OTP state ──
    const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otpSending, setOtpSending] = useState<boolean>(false);
    const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
    const [otpCountdown, setOtpCountdown] = useState<number>(0);    // 5-min OTP expiry countdown (seconds)
    const [resendCooldown, setResendCooldown] = useState<number>(0); // 60-sec resend cooldown
    const [otpMessage, setOtpMessage] = useState<string>('');

    const { signup } = useAuth();
    const navigate = useNavigate();

    // ─────────────── Username availability check ───────────────
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!username || username.trim().length < 3) {
            setUsernameStatus('idle');
            return;
        }

        setUsernameStatus('checking');

        debounceTimer.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${API_BASE}/auth/register/check-if-username-exists?userName=${encodeURIComponent(username.trim())}`
                );
                if (!response.ok) { setUsernameStatus('error'); return; }
                const exists: boolean = await response.json();
                setUsernameStatus(exists ? 'taken' : 'available');
            } catch {
                setUsernameStatus('error');
            }
        }, 500);

        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }, [username]);

    // ─────────────── Email availability check ───────────────
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    useEffect(() => {
        if (emailDebounceTimer.current) clearTimeout(emailDebounceTimer.current);

        if (!email || email.trim().length < 3) {
            setEmailStatus('idle');
            return;
        }

        if (!emailRegex.test(email.trim())) {
            setEmailStatus('invalid');
            return;
        }

        setEmailStatus('checking');

        emailDebounceTimer.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${API_BASE}/auth/register/check-if-email-exists?mailId=${encodeURIComponent(email.trim())}`
                );
                if (!response.ok) { setEmailStatus('error'); return; }
                const exists: boolean = await response.json();
                setEmailStatus(exists ? 'taken' : 'available');
            } catch {
                setEmailStatus('error');
            }
        }, 500);

        return () => { if (emailDebounceTimer.current) clearTimeout(emailDebounceTimer.current); };
    }, [email]);

    // ─────────────── Countdown timers ───────────────
    useEffect(() => {
        if (otpCountdown <= 0) return;
        const id = setInterval(() => setOtpCountdown(prev => prev - 1), 1000);
        return () => clearInterval(id);
    }, [otpCountdown]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const id = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
        return () => clearInterval(id);
    }, [resendCooldown]);

    // ─────────────── Password strength ───────────────
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

    // ─────────────── Send OTP (Step 1 → Step 2) ───────────────
    const handleSendOtp = useCallback(async () => {
        setError('');
        setOtpSending(true);

        try {
            const res = await fetch(`${API_BASE}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), username: username.trim() })
            });

            if (!res.ok) {
                const msg = await res.text();
                setError(msg || 'Failed to send OTP. Please check your email address.');
                return;
            }

            setOtpDigits(['', '', '', '', '', '']);
            setOtpMessage('');
            setOtpCountdown(300); // 5 minutes
            setResendCooldown(60);
            setStep(2);
        } catch {
            setError('Network error. Could not send OTP.');
        } finally {
            setOtpSending(false);
        }
    }, [email, username]);

    // ─────────────── Resend OTP ───────────────
    const handleResendOtp = useCallback(async () => {
        setError('');
        setOtpSending(true);

        try {
            const res = await fetch(`${API_BASE}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), username: username.trim() })
            });

            if (!res.ok) {
                const msg = await res.text();
                setError(msg || 'Failed to resend OTP.');
                return;
            }

            setOtpDigits(['', '', '', '', '', '']);
            setOtpMessage('A new OTP has been sent to your email.');
            setOtpCountdown(300);
            setResendCooldown(60);
        } catch {
            setError('Network error. Could not resend OTP.');
        } finally {
            setOtpSending(false);
        }
    }, [email, username]);

    // ─────────────── Verify OTP (Step 2 → Step 3) ───────────────
    const handleVerifyOtp = useCallback(async () => {
        setError('');
        setOtpMessage('');

        const otpValue = otpDigits.join('');
        if (otpValue.length !== 6) {
            setError('Please enter the 6-digit OTP.');
            return;
        }

        setOtpVerifying(true);

        try {
            const res = await fetch(`${API_BASE}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), otp: otpValue })
            });

            if (!res.ok) {
                const msg = await res.text();
                setError(msg || 'Invalid or expired OTP. Please try again.');
                return;
            }

            setStep(3);
        } catch {
            setError('Network error. Could not verify OTP.');
        } finally {
            setOtpVerifying(false);
        }
    }, [email, otpDigits]);

    // ─────────────── Final registration (Step 3) ───────────────
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

    // ─────────────── Helpers ───────────────
    const strengthColor = strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500';

    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500";

    // ─────────────── OTP box handlers ───────────────
    function handleOtpChange(index: number, value: string): void {
        if (!/^\d?$/.test(value)) return; // only single digit or empty
        const newDigits = [...otpDigits];
        newDigits[index] = value;
        setOtpDigits(newDigits);

        // Auto-advance to next box
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    }

    function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            // Move focus back on backspace when current box is empty
            otpInputRefs.current[index - 1]?.focus();
        }
    }

    function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>): void {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 0) return;
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
            newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        // Focus the next empty box, or the last one
        const nextEmpty = newDigits.findIndex(d => d === '');
        otpInputRefs.current[nextEmpty >= 0 ? nextEmpty : 5]?.focus();
    }

    const canSendOtp =
        username.trim().length >= 3 &&
        usernameStatus !== 'taken' &&
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        emailStatus === 'available' &&
        !otpSending;

    function formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // ─────────────── Step indicators ───────────────
    function StepIndicator() {
        const steps = [
            { num: 1, label: 'Your Info' },
            { num: 2, label: 'Verify Email' },
            { num: 3, label: 'Set Password' }
        ];

        return (
            <div className="flex items-center justify-center gap-0 mb-8">
                {steps.map((s, i) => (
                    <React.Fragment key={s.num}>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= s.num
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                    : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-400'
                                }`}>
                                {step > s.num ? '✓' : s.num}
                            </div>
                            <span className={`text-xs font-medium transition-colors ${step >= s.num ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'
                                }`}>{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`w-16 h-0.5 mb-5 mx-1 rounded-full transition-all duration-300 ${step > s.num ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-600'
                                }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    // ─────────────── Render ───────────────
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
                    <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="text-3xl">🌱</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">AI Soil Health</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create Account</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Join us and start optimizing your soil health</p>
                    </div>

                    <StepIndicator />

                    {error && <div className="text-red-500 text-sm text-center mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{error}</div>}
                    {otpMessage && <div className="text-emerald-600 dark:text-emerald-400 text-sm text-center mb-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">{otpMessage}</div>}

                    {/* ═══════════ STEP 1: User Info + Send OTP ═══════════ */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Username</label>
                                <input type="text" id="username" placeholder="Choose a unique username" required value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} className={inputClass} />
                                {usernameStatus === 'checking' && (
                                    <span className="text-xs text-gray-500 dark:text-slate-400 mt-1 block">Checking availability...</span>
                                )}
                                {usernameStatus === 'available' && (
                                    <span className="text-xs text-green-600 dark:text-green-400 mt-1 block font-medium">✓ Username is available</span>
                                )}
                                {usernameStatus === 'taken' && (
                                    <span className="text-xs text-red-500 dark:text-red-400 mt-1 block font-medium">✗ Username is already taken!</span>
                                )}
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
                                {emailStatus === 'invalid' && (
                                    <span className="text-xs text-red-500 dark:text-red-400 mt-1 block font-medium">✗ Please enter a valid email address</span>
                                )}
                                {emailStatus === 'checking' && (
                                    <span className="text-xs text-gray-500 dark:text-slate-400 mt-1 block">Checking availability...</span>
                                )}
                                {emailStatus === 'available' && (
                                    <span className="text-xs text-green-600 dark:text-green-400 mt-1 block font-medium">✓ Email is available</span>
                                )}
                                {emailStatus === 'taken' && (
                                    <span className="text-xs text-red-500 dark:text-red-400 mt-1 block font-medium">✗ Email is already registered!</span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={!canSendOtp}
                                className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
                            >
                                {otpSending ? (
                                    <><Loader2 size={20} className="animate-spin" /> Sending OTP...</>
                                ) : (
                                    <><Mail size={20} /> Send Verification OTP</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* ═══════════ STEP 2: Enter & Verify OTP ═══════════ */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3">
                                    <Mail size={32} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                    We've sent a 6-digit code to<br />
                                    <span className="font-semibold text-gray-800 dark:text-white">{email}</span>
                                </p>
                            </div>

                            {/* OTP countdown timer */}
                            {otpCountdown > 0 ? (
                                <div className="text-center">
                                    <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${otpCountdown <= 60
                                        ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                        : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                                        }`}>
                                        ⏱️ OTP expires in {formatTime(otpCountdown)}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                        ⚠️ OTP has expired. Please resend.
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 text-center">Enter OTP</label>
                                <div className="flex justify-center gap-3">
                                    {otpDigits.map((digit, i) => (
                                        <div key={i} className="relative">
                                            <input
                                                ref={(el) => { otpInputRefs.current[i] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                onPaste={handleOtpPaste}
                                                autoFocus={i === 0}
                                                className={`w-12 h-14 rounded-xl border-2 bg-gray-50 dark:bg-slate-700 text-center text-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-400 caret-transparent ${digit
                                                    ? 'border-emerald-400 dark:border-emerald-500 text-transparent selection:bg-transparent'
                                                    : 'border-gray-200 dark:border-slate-600 text-transparent'
                                                    }`}
                                            />
                                            {/* Emerald dot when digit is filled */}
                                            {digit && (
                                                <div
                                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-3.5 h-3.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-sm shadow-emerald-500/40"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={otpDigits.join('').length !== 6 || otpVerifying || otpCountdown <= 0}
                                className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
                            >
                                {otpVerifying ? (
                                    <><Loader2 size={20} className="animate-spin" /> Verifying...</>
                                ) : (
                                    <><ShieldCheck size={20} /> Verify OTP</>
                                )}
                            </button>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setError(''); setOtpMessage(''); }}
                                    className="text-sm text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-transparent border-none cursor-pointer transition-colors"
                                >
                                    ← Change email
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendCooldown > 0 || otpSending}
                                    className={`text-sm bg-transparent border-none cursor-pointer transition-colors ${resendCooldown > 0
                                        ? 'text-gray-400 dark:text-slate-500 cursor-not-allowed'
                                        : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium'
                                        }`}
                                >
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══════════ STEP 3: Password + Create Account ═══════════ */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="text-center mb-2">
                                <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full">
                                    <ShieldCheck size={16} />
                                    Email verified: {email}
                                </div>
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
                    )}

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500 dark:text-slate-400">Already have an account? <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline no-underline">Sign in</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
