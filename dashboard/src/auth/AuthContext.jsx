import React, {createContext, useState, useContext, useEffect} from "react";
import axios from "axios";

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";
export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [loading, setLoading] = useState(true);

    async function fetchMe(t) {
            const res = await axios.get(`${API_BASE}/auth/me`, {
                headers: {Authorization: `Bearer ${t}`}
            });
            return res.data.user;
    }

    useEffect(() => {
        (async () => {
            try {
                if (token) {
                    const userData = await fetchMe(token);
                    setUser(userData);
                } else {
                    setUser(null);
                    return;
                }
            } catch (err) {
                console.error("Failed to fetch user data:", err);
                setUser(null);
                setToken("");
                localStorage.removeItem("token");
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    async function login(email, password) {
        const res = await axios.post(`${API_BASE}/auth/login`, {email, password});
        const t = res.data.token;
        setToken(t);
        localStorage.setItem("token", t);
    }

    async function signup(email, password) {
        const res = await axios.post(`${API_BASE}/auth/signup`, {email, password});
        const t = res.data.token;
        setToken(t);
        localStorage.setItem("token", t);
    }

    function logout() {
        setUser(null);
        setToken("");
        localStorage.removeItem("token");
    }

    return (
        <AuthContext.Provider value={{user, token, login, signup, logout, loading}}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}