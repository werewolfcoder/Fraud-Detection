import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Store user info
    const navigate = useNavigate();

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

    const login = async (credentials) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/auth/login`,
                credentials
            );
            const { token, user: userData } = response.data;
            localStorage.setItem("token", token);
            setUser(userData);
            navigate("/");
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

    return (
        <AuthContext.Provider value={{ user,setUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};



