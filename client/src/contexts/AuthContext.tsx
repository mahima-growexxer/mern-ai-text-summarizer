/**
 * @author Mahima Gajiwala
 * @copyright 2025
 * 
 * Authentication context for AI Text Summarizer
 * Manages user authentication state
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    isAdmin: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    signIn: (token: string, user: User) => void;
    signOut: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Check for stored authentication data on app load
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(userData);
            } catch {
                // Clear invalid stored data
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
            }
        }
    }, []);

    const signIn = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(newUser));
    };

    const signOut = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    };

    const isAuthenticated = !!user && !!token;
    const isAdmin = user?.isAdmin || false;

    return (
        <AuthContext.Provider value={{
            user,
            token,
            signIn,
            signOut,
            isAuthenticated,
            isAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
