import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${API.GATEWAY}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setUser({ ...res.data.data, token });
                })
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await axios.post(`${API.GATEWAY}/auth/login`, { email, password });
        const userData = res.data.data;
        localStorage.setItem('token', userData.token);
        setUser(userData);
        return userData;
    };

    const register = async (username, email, password) => {
        const res = await axios.post(`${API.GATEWAY}/auth/register`, { username, email, password });
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
