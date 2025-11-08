'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    locationLat?: number;
    locationLng?: number;
    firebaseUid?: string;
    role: string;
    username?: string;
}

interface AdminAuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (username: string, password: string) => Promise<void>;
    signOut: () => void;
    isAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in (from localStorage)
        const storedUser = localStorage.getItem('admin_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('admin_user');
            }
        }
        setLoading(false);
    }, []);

    const signIn = async (username: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }

            const { user: userData } = await response.json();

            // Store user in state and localStorage
            setUser(userData);
            localStorage.setItem('admin_user', JSON.stringify(userData));
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    const signOut = () => {
        setUser(null);
        localStorage.removeItem('admin_user');
    };

    const value: AdminAuthContextType = {
        user,
        loading,
        signIn,
        signOut,
        isAdmin: user?.role === 'admin',
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}
