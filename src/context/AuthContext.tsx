import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = 'http://localhost:8080';

interface User {
    email: string;
    displayName: string;
    token: string;
}

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signup: (email: string, password: string, firstName: string, lastName: string, username: string) => Promise<unknown>;
    login: (email: string, password: string) => Promise<unknown>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

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
                .then((data: { email: string; displayName: string }) => {
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

    async function signup(email: string, password: string, firstName: string, lastName: string, username: string): Promise<unknown> {
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

    async function login(email: string, password: string): Promise<unknown> {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || 'Login failed');
        }

        const data = await res.json() as { email: string; displayName: string; token: string };
        localStorage.setItem('token', data.token);
        setCurrentUser({
            email: data.email,
            displayName: data.displayName,
            token: data.token
        });
        return data;
    }

    function logout(): Promise<void> {
        localStorage.removeItem('token');
        setCurrentUser(null);
        return Promise.resolve();
    }

    const value: AuthContextType = {
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
