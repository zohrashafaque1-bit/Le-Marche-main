/**
 * AuthContext - Manages user authentication state
 * Provides login, logout, and user info throughout the app
 */

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                    setToken(savedToken);
                } catch (error) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        
        // Fetch full user profile to ensure we have all data including role
        try {
            const profileRes = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${newToken}` }
            });
            setUser(profileRes.data);
        } catch (error) {
            // Fallback to login response data
            setUser(userData);
        }
        
        return response.data;
    };

    // Register function
    const register = async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        
        return response.data;
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        const response = await api.put('/auth/profile', profileData);
        setUser(response.data);
        return response.data;
    };

    // Check if user is admin
    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
