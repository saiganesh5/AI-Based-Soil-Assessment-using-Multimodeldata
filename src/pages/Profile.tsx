import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    ArrowLeft, User, Pencil, X, Loader2, Save, Mail, AtSign,
    LayoutDashboard, Home, Cloud, Leaf, LogOut, Shield, Calendar
} from 'lucide-react';

const API_BASE = 'http://soilhealthassessment.ap-south-1.elasticbeanstalk.com:5000';

interface UserProfile {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
}

export default function Profile(): React.JSX.Element {
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // ── Edit state ──
    const [editing, setEditing] = useState<boolean>(false);
    const [editFirstName, setEditFirstName] = useState<string>('');
    const [editLastName, setEditLastName] = useState<string>('');
    const [editUsername, setEditUsername] = useState<string>('');
    const [saving, setSaving] = useState<boolean>(false);
    const [saveSuccess, setSaveSuccess] = useState<string>('');

    // ── Username availability ──
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'same'>('idle');
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ─────────────── Fetch user profile ───────────────
    useEffect(() => {
        async function fetchProfile() {
            try {
                const token = currentUser?.token || localStorage.getItem('token');
                if (!token) { setError('Not authenticated'); setLoading(false); return; }

                const res = await fetch(`${API_BASE}/fetch-user`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) { setError('Failed to load profile'); setLoading(false); return; }

                const data: UserProfile = await res.json();
                setProfile(data);
            } catch {
                setError('Network error. Could not load profile.');
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [currentUser]);

    // ─────────────── Username check ───────────────
    useEffect(() => {
        if (!editing) return;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!editUsername || editUsername.trim().length < 3) { setUsernameStatus('idle'); return; }
        if (profile && editUsername.trim() === profile.username) { setUsernameStatus('same'); return; }

        setUsernameStatus('checking');

        debounceTimer.current = setTimeout(async () => {
            try {
                const res = await fetch(`${API_BASE}/auth/register/check-if-username-exists?userName=${encodeURIComponent(editUsername.trim())}`);
                if (!res.ok) { setUsernameStatus('idle'); return; }
                const exists: boolean = await res.json();
                setUsernameStatus(exists ? 'taken' : 'available');
            } catch { setUsernameStatus('idle'); }
        }, 500);

        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }, [editUsername, editing, profile]);

    // ─────────────── Edit handlers ───────────────
    function startEditing() {
        if (!profile) return;
        setEditFirstName(profile.firstName || '');
        setEditLastName(profile.lastName || '');
        setEditUsername(profile.username || '');
        setUsernameStatus('idle');
        setSaveSuccess('');
        setError('');
        setEditing(true);
    }

    function cancelEditing() { setEditing(false); setError(''); }

    async function handleSave() {
        if (usernameStatus === 'taken') { setError('Username is already taken.'); return; }
        if (editUsername.trim().length < 3) { setError('Username must be at least 3 characters.'); return; }
        if (!editFirstName.trim() || !editLastName.trim()) { setError('First name and last name are required.'); return; }

        try {
            setError(''); setSaving(true);
            const token = currentUser?.token || localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/update-user`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ firstName: editFirstName.trim(), lastName: editLastName.trim(), username: editUsername.trim() })
            });

            if (!res.ok) { const msg = await res.text(); setError(msg || 'Failed to update profile.'); return; }

            const updated: UserProfile = await res.json();
            setProfile(updated);
            setEditing(false);
            setSaveSuccess('Profile updated successfully!');
            setTimeout(() => setSaveSuccess(''), 3000);
        } catch {
            setError('Network error. Could not save changes.');
        } finally {
            setSaving(false);
        }
    }

    async function handleLogout() {
        await logout();
        navigate('/login');
    }

    // ─────────────── Helpers ───────────────
    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500";

    function getInitials(first: string, last: string): string {
        return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || '?';
    }

    const sideNavItems = [
        { icon: Home, label: 'Home', to: '/' },
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: Cloud, label: 'Weather', to: '/weather' },
        { icon: Leaf, label: 'Disease Prediction', to: '/predict-disease' },
    ];

    const joinDate = 'Member since 2026';

    // ─────────────── Render ───────────────
    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">

            {/* ═══════════ LEFT SIDEBAR ═══════════ */}
            <aside className="w-72 min-h-screen bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-r border-gray-200/60 dark:border-slate-700/60 flex flex-col fixed left-0 top-0 z-20">

                {/* Logo */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-700/50">
                    <Link to="/" className="flex items-center gap-3 no-underline">
                        <span className="text-3xl">🌱</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">AI Soil Health</span>
                    </Link>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-4 space-y-1">
                    {sideNavItems.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all no-underline group"
                        >
                            <item.icon size={18} className="text-gray-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors" />
                            {item.label}
                        </Link>
                    ))}

                    {/* Active: Profile */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                        <User size={18} />
                        Profile
                    </div>
                </nav>

                {/* Theme Toggle + Logout */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-700/50 space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all cursor-pointer bg-transparent border-none text-left"
                    >
                        <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer bg-transparent border-none text-left"
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* ═══════════ MAIN CONTENT AREA ═══════════ */}
            <main className="flex-1 ml-72">

                {/* ── Top Header Bar ── */}
                <header className="sticky top-0 z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors no-underline text-gray-400 dark:text-slate-500">
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                                <p className="text-xs text-gray-500 dark:text-slate-400">Manage your account information</p>
                            </div>
                        </div>

                        {!editing && profile && (
                            <button
                                type="button"
                                onClick={startEditing}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all cursor-pointer border-none"
                            >
                                <Pencil size={16} /> Edit Profile
                            </button>
                        )}
                    </div>
                </header>

                {/* ── Content ── */}
                <div className="p-8">

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-32">
                            <div className="text-center">
                                <Loader2 size={40} className="animate-spin text-emerald-500 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-slate-400 text-sm">Loading your profile...</p>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {error && <div className="text-red-500 text-sm text-center mb-6 bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800/30">{error}</div>}
                    {saveSuccess && (
                        <div className="text-emerald-600 dark:text-emerald-400 text-sm text-center mb-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700/30 animate-pulse">
                            ✓ {saveSuccess}
                        </div>
                    )}

                    {!loading && profile && (
                        <div className="space-y-8">

                            {/* ═══════ HERO BANNER / PROFILE HEADER ═══════ */}
                            <div className="relative rounded-2xl overflow-hidden">
                                {/* Gradient Banner */}
                                <div className="h-48 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative">
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                                    <div className="absolute bottom-4 right-6 text-white/20 text-6xl font-black select-none">🌱</div>
                                </div>

                                {/* Profile Card overlapping the banner */}
                                <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl mx-6 -mt-20 p-6 border border-gray-100 dark:border-slate-700/50">
                                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                                        {/* Avatar */}
                                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-emerald-500/30 border-4 border-white dark:border-slate-800 -mt-16 md:-mt-20 flex-shrink-0">
                                            {getInitials(profile.firstName, profile.lastName)}
                                        </div>

                                        {/* Name & Meta */}
                                        <div className="flex-1 text-center md:text-left pb-1">
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {profile.firstName} {profile.lastName}
                                            </h2>
                                            <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">@{profile.username}</p>
                                            <div className="flex items-center gap-4 mt-2 justify-center md:justify-start">
                                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
                                                    <Calendar size={12} /> {joinDate}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500">
                                                    <Shield size={12} /> Verified Account
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ═══════ DETAILS GRID ═══════ */}
                            {!editing ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Account Info */}
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
                                        <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                                            <User size={14} /> Account Information
                                        </h3>
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                                    <Mail size={18} className="text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Email Address</p>
                                                    <p className="text-sm text-gray-800 dark:text-white font-semibold truncate">{profile.email}</p>
                                                </div>
                                                <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex-shrink-0">Verified</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                                                    <AtSign size={18} className="text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Username</p>
                                                    <p className="text-sm text-gray-800 dark:text-white font-semibold">{profile.username}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Info */}
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
                                        <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                                            <Shield size={14} /> Personal Details
                                        </h3>
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                                                    <User size={18} className="text-sky-600 dark:text-sky-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">First Name</p>
                                                    <p className="text-sm text-gray-800 dark:text-white font-semibold">{profile.firstName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                                    <User size={18} className="text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Last Name</p>
                                                    <p className="text-sm text-gray-800 dark:text-white font-semibold">{profile.lastName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm">
                                        <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-5">
                                            Quick Actions
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <Link to="/dashboard" className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/30 transition-all group no-underline">
                                                <LayoutDashboard size={24} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                                <span className="text-xs font-medium text-gray-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Dashboard</span>
                                            </Link>
                                            <Link to="/weather" className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-transparent hover:border-sky-200 dark:hover:border-sky-800/30 transition-all group no-underline">
                                                <Cloud size={24} className="text-gray-400 group-hover:text-sky-500 transition-colors" />
                                                <span className="text-xs font-medium text-gray-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400">Weather</span>
                                            </Link>
                                            <Link to="/predict-disease" className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-transparent hover:border-teal-200 dark:hover:border-teal-800/30 transition-all group no-underline">
                                                <Leaf size={24} className="text-gray-400 group-hover:text-teal-500 transition-colors" />
                                                <span className="text-xs font-medium text-gray-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400">Disease</span>
                                            </Link>
                                            <Link to="/auth/forgot-password" className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-violet-50 dark:hover:bg-violet-900/20 border border-transparent hover:border-violet-200 dark:hover:border-violet-800/30 transition-all group no-underline">
                                                <Shield size={24} className="text-gray-400 group-hover:text-violet-500 transition-colors" />
                                                <span className="text-xs font-medium text-gray-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400">Change Password</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* ═══════ EDIT MODE ═══════ */
                                <div className="max-w-2xl">
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700/50 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Pencil size={18} className="text-emerald-500" /> Edit Your Profile
                                        </h3>

                                        <div className="space-y-5">
                                            {/* Email (read-only) */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Email Address</label>
                                                <input type="email" value={profile.email} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
                                                <span className="text-xs text-gray-400 dark:text-slate-500 mt-1 block">Email cannot be changed</span>
                                            </div>

                                            {/* Username */}
                                            <div>
                                                <label htmlFor="editUsername" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Username</label>
                                                <input type="text" id="editUsername" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className={inputClass} placeholder="Choose a username" />
                                                {usernameStatus === 'checking' && <span className="text-xs text-gray-500 dark:text-slate-400 mt-1 block">Checking availability...</span>}
                                                {usernameStatus === 'available' && <span className="text-xs text-green-600 dark:text-green-400 mt-1 block font-medium">✓ Username is available</span>}
                                                {usernameStatus === 'taken' && <span className="text-xs text-red-500 dark:text-red-400 mt-1 block font-medium">✗ Username is already taken!</span>}
                                            </div>

                                            {/* First & Last Name */}
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label htmlFor="editFirstName" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">First Name</label>
                                                    <input type="text" id="editFirstName" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className={inputClass} placeholder="John" />
                                                </div>
                                                <div className="flex-1">
                                                    <label htmlFor="editLastName" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Last Name</label>
                                                    <input type="text" id="editLastName" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className={inputClass} placeholder="Doe" />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-4">
                                                <button type="button" onClick={cancelEditing}
                                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all font-medium bg-transparent cursor-pointer">
                                                    <X size={18} /> Cancel
                                                </button>
                                                <button type="button" onClick={handleSave} disabled={saving || usernameStatus === 'taken'}
                                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !profile && !error && (
                        <div className="text-center py-20 text-gray-500 dark:text-slate-400">
                            <User size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">Could not load profile information.</p>
                            <Link to="/dashboard" className="text-emerald-600 dark:text-emerald-400 mt-2 inline-block no-underline hover:underline">← Go to Dashboard</Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
