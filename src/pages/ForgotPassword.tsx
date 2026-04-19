import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Mail, ShieldCheck, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

const API_BASE = 'http://soilhealthassessment.ap-south-1.elasticbeanstalk.com:5000';

export default function ForgotPassword(): React.JSX.Element {
    // ── Step state (1 → 2 → 3 → success) ──
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

    // ── Form fields ──
    const [email, setEmail] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // ── Password strength ──
    const [strength, setStrength] = useState<number>(0);
    const [strengthText, setStrengthText] = useState<string>('Password strength');

    // ── OTP state ──
    const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otpSending, setOtpSending] = useState<boolean>(false);
    const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
    const [otpCountdown, setOtpCountdown] = useState<number>(0);
    const [resendCooldown, setResendCooldown] = useState<number>(0);
    const [otpMessage, setOtpMessage] = useState<string>('');

    // ── Email validation ──
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const navigate = useNavigate();

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
        setNewPassword(val);
        checkStrength(val);
    }

    // ─────────────── Send OTP (Step 1 → Step 2) ───────────────
    const handleSendOtp = useCallback(async () => {
        setError('');
        setOtpSending(true);

        try {
            const res = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            });

            if (!res.ok) {
                const msg = await res.text();
                setError(msg || 'Failed to send OTP. Please check your email address.');
                return;
            }

            setOtpDigits(['', '', '', '', '', '']);
            setOtpMessage('');
            setOtpCountdown(300);
            setResendCooldown(60);
            setStep(2);
        } catch {
            setError('Network error. Could not send OTP.');
        } finally {
            setOtpSending(false);
        }
    }, [email]);

    // ─────────────── Resend OTP ───────────────
    const handleResendOtp = useCallback(async () => {
        setError('');
        setOtpSending(true);

        try {
            const res = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
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
    }, [email]);

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

    // ─────────────── Reset password (Step 3 → success) ───────────────
    async function handleResetPassword(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (strength < 2) {
            setError('Please choose a stronger password');
            return;
        }

        try {
            setError('');
            setLoading(true);

            const res = await fetch(`${API_BASE}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), newPassword })
            });

            if (!res.ok) {
                const msg = await res.text();
                setError(msg || 'Failed to reset password.');
                return;
            }

            setStep(4);
        } catch {
            setError('Network error. Could not reset password.');
        } finally {
            setLoading(false);
        }
    }

    // ─────────────── OTP box handlers ───────────────
    function handleOtpChange(index: number, value: string): void {
        if (!/^\d?$/.test(value)) return;
        const newDigits = [...otpDigits];
        newDigits[index] = value;
        setOtpDigits(newDigits);

        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    }

    function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
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
        const nextEmpty = newDigits.findIndex(d => d === '');
        otpInputRefs.current[nextEmpty >= 0 ? nextEmpty : 5]?.focus();
    }

    // ─────────────── Helpers ───────────────
    const strengthColor = strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500';

    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500";

    const canSendOtp = emailRegex.test(email.trim()) && !otpSending;

    function formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // ─────────────── Step indicators ───────────────
    function StepIndicator() {
        const steps = [
            { num: 1, label: 'Email' },
            { num: 2, label: 'Verify OTP' },
            { num: 3, label: 'New Password' }
        ];

        const activeStep = step === 4 ? 4 : step;

        return (
            <div className="flex items-center justify-center gap-0 mb-8">
                {steps.map((s, i) => (
                    <React.Fragment key={s.num}>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${activeStep >= s.num
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-400'
                                }`}>
                                {activeStep > s.num ? '✓' : s.num}
                            </div>
                            <span className={`text-xs font-medium transition-colors ${activeStep >= s.num ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'
                                }`}>{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`w-16 h-0.5 mb-5 mx-1 rounded-full transition-all duration-300 ${activeStep > s.num ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-600'
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
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 no-underline transition-colors">
                    <ArrowLeft size={20} />
                    Back to Login
                </Link>

                <div className="card-glass p-8">
                    <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="text-3xl">🌱</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">AI Soil Health</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reset Password</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">We'll help you get back into your account</p>
                    </div>

                    {step !== 4 && <StepIndicator />}

                    {error && <div className="text-red-500 text-sm text-center mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{error}</div>}
                    {otpMessage && <div className="text-emerald-600 dark:text-emerald-400 text-sm text-center mb-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">{otpMessage}</div>}

                    {/* ═══════════ STEP 1: Enter Email ═══════════ */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3">
                                    <KeyRound size={32} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                    Enter the email address associated with your account.<br />
                                    We'll send you a verification code.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="your.email@example.com"
                                    required
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    className={inputClass}
                                    autoFocus
                                />
                                {email && !emailRegex.test(email.trim()) && (
                                    <span className="text-xs text-red-500 dark:text-red-400 mt-1 block font-medium">✗ Please enter a valid email address</span>
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
                                    <><Mail size={20} /> Send Verification Code</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* ═══════════ STEP 2: Verify OTP ═══════════ */}
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

                    {/* ═══════════ STEP 3: Set New Password ═══════════ */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="text-center mb-2">
                                <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full">
                                    <ShieldCheck size={16} />
                                    Email verified: {email}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">New Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} id="newPassword" placeholder="Create a strong password" required value={newPassword} onChange={handlePasswordChange} className={`${inputClass} pr-12`} />
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
                                <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                                <div className="relative">
                                    <input type={showConfirmPassword ? "text" : "password"} id="confirmNewPassword" placeholder="Re-enter your new password" required value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} className={`${inputClass} pr-12`} />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 bg-transparent border-none cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2" disabled={loading}>
                                {loading ? (
                                    <><Loader2 size={20} className="animate-spin" /> Resetting Password...</>
                                ) : (
                                    <><KeyRound size={20} /> Reset Password</>
                                )}
                            </button>
                        </form>
                    )}

                    {/* ═══════════ STEP 4: Success ═══════════ */}
                    {step === 4 && (
                        <div className="space-y-6 text-center">
                            <div>
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                                    <CheckCircle2 size={40} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Reset Successful!</h2>
                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                    Your password has been updated successfully.<br />
                                    You can now sign in with your new password.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={20} /> Back to Login
                            </button>
                        </div>
                    )}

                    {step !== 4 && (
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-500 dark:text-slate-400">Remember your password? <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline no-underline">Sign in</Link></p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
