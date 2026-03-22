import { createContext, useEffect, useState } from "react";
import { toast } from "sonner";
import API from "../api/axios.js";


export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        const response = await API.get("/auth/me");
        if (response.data.success) {
            setUser(response.data.user);
            return response.data.user;
        }

        setUser(null);
        return null;
    };

    /*
        - Called on app load
        - Checks if cookies are valid
        - If valid, fetch user data and set user state
        - If not valid, set user to null
     */
    useEffect(() => {
        const loadUser = async () => {
            try {
                await refreshUser();
                
            } catch (error) { 
                if (error.response?.status === 401) {
                    toast.error("Session expired. Please log in again.");
                }
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Login function
    const login = async ({ email, password }) => {
        const response = await API.post("/auth/login", { email, password });
        await refreshUser();

        return response.data;
    };

    // Logout function
    const logout = async () => {
        await API.post("/auth/logout");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );

};

export default AuthContext;