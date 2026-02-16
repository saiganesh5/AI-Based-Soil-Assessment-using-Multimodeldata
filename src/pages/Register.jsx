import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password strength calculation
    const [strength, setStrength] = useState(0);
    const [strengthText, setStrengthText] = useState('Password strength');

    const { signup } = useAuth();
    const navigate = useNavigate();

    function checkStrength(pass) {
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

    function handlePasswordChange(e) {
        const val = e.target.value;
        setPassword(val);
        checkStrength(val);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, firstName, lastName, username);
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create an account.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            <div className="auth-container">
                <Link to="/" className="back-link">
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                <div className="auth-card card-glass">
                    <div className="auth-header">
                        <div className="logo">
                            <span className="logo-icon">🌱</span>
                            <span className="logo-text">AI Soil Health</span>
                        </div>
                        <h1>Create Account</h1>
                        <p>Join us and start optimizing your soil health</p>
                    </div>

                    {error && <div className="auth-error" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">Username</label>
                            <input
                                type="text"
                                id="username"
                                className="form-input"
                                placeholder="Choose a unique username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>


                        <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="firstName" className="form-label">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    className="form-input"
                                    placeholder="John"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>

                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="lastName" className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    className="form-input"
                                    placeholder="Doe"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder="your.email@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="form-input"
                                    placeholder="Create a strong password"
                                    required
                                    value={password}
                                    onChange={handlePasswordChange}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{
                                            width: `${(strength / 5) * 100}%`,
                                            backgroundColor: strength < 2 ? '#ff4d4d' : strength < 4 ? '#ffca28' : '#66bb6a'
                                        }}
                                    ></div>
                                </div>
                                <span className="strength-text">{strengthText}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    className="form-input"
                                    placeholder="Re-enter your password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input type="checkbox" name="terms" required />
                                <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Sign in</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
