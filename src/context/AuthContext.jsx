import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = 'http://localhost:8080';
const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check for saved token and restore session
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Token invalid');
                    return res.json();
                })
                .then(data => {
                    setCurrentUser({
                        email: data.email,
                        displayName: data.displayName,
                        token: token
                    });
                })
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    async function signup(email, password, firstName, lastName, username) {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, firstName, lastName })
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || 'Registration failed');
        }

        // Don't auto-login — user will be redirected to login page
        return await res.json();
    }

    async function login(email, password) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || 'Login failed');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        setCurrentUser({
            email: data.email,
            displayName: data.displayName,
            token: data.token
        });
        return data;
    }

    function logout() {
        localStorage.removeItem('token');
        setCurrentUser(null);
        return Promise.resolve();
    }

    const value = {
        currentUser,
        loading,
        signup,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
