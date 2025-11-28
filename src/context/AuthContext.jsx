import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configure axios defaults
// axios.defaults.baseURL = 'http://localhost:5000'; // Using Vite proxy instead
axios.defaults.withCredentials = true;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Remove localStorage token handling since we're using HttpOnly cookies
            const response = await axios.get('/api/auth/me', {
                withCredentials: true
            });
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await axios.post('/api/auth/register', userData, {
                withCredentials: true
            });

            if (response.data.success) {
                setUser(response.data.user);
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message ||
                error.response?.data?.errors?.[0]?.message ||
                'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await axios.post('/api/auth/login', credentials, {
                withCredentials: true
            });

            if (response.data.success) {
                setUser(response.data.user);
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout', {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};