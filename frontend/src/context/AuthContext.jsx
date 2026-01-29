import { createContext, useEffect, useState } from "react";
import API from "../api/axios.js";


export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /*
        - Called on app load
        - Checks if cookies are valid
        - If valid, fetch user data and set user state
        - If not valid, set user to null
     */
    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await API.get("/auth/me");

                if (response.data.success) setUser(response.data.user);
                
            } catch (error) { 
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Login function
    const login = async (data) => {
        const response = await API.post("/auth/login", data);
        setUser(response.data.user);
    };

    // Logout function
    const logout = async () => {
        await API.post("/auth/logout");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );

};

export default AuthContext;