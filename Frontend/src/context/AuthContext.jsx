import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Store user info
    const navigate = useNavigate();

    const refreshToken = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return false;

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/auth/refresh-token`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            localStorage.setItem("token", response.data.token);
            return true;
        } catch (error) {
            console.error("Token refresh failed:", error);
            return false;
        }
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/auth/profile`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setUser(response.data.user);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                localStorage.removeItem("token");
                navigate("/auth");
            }
        };

        fetchUserProfile();
    }, [navigate]);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;
                
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    if (await refreshToken()) {
                        const token = localStorage.getItem("token");
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axios(originalRequest);
                    } else {
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/auth/login`,
                credentials
            );
            const { token, user: userData } = response.data;
            localStorage.setItem("token", token);
            setUser(userData);
            // Redirect based on role
            navigate(userData.role === 'admin' ? '/admin_dashboard' : '/');
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            navigate("/auth");
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}/auth/logout`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            localStorage.removeItem("token");
            setUser(null);
            navigate("/auth");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const updateUserBalance = (newBalance) => {
        setUser(prevUser => ({
            ...prevUser,
            account_balance: newBalance
        }));
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            setUser, 
            login, 
            logout, 
            refreshToken,
            updateUserBalance // Add this new function to the context
        }}>
            {children}
        </AuthContext.Provider>
    );
};