import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('ecovolt_auth_token');
        const storedUser = localStorage.getItem('ecovolt_user');
        if (storedToken && storedUser) {
            setIsAuthenticated(true);
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        const nextUser = data?.user || { role: 'admin', display_name: 'EcoVolt Admin', email };
        const token = data?.token || 'dummy-session-token';
        setIsAuthenticated(true);
        setUser(nextUser);
        localStorage.setItem('ecovolt_auth', 'true');
        localStorage.setItem('ecovolt_auth_token', token);
        localStorage.setItem('ecovolt_user', JSON.stringify(nextUser));
        return true;
    };

    const loginAsGuest = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const guestUser = { role: 'guest', name: 'Guest User' };
                setIsAuthenticated(true);
                setUser(guestUser);
                localStorage.setItem('ecovolt_auth', 'true');
                localStorage.setItem('ecovolt_user', JSON.stringify(guestUser));
                resolve(true);
            }, 600); // Simulate quick guest login
        });
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('ecovolt_auth');
        localStorage.removeItem('ecovolt_auth_token');
        localStorage.removeItem('ecovolt_user');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, loginAsGuest, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
