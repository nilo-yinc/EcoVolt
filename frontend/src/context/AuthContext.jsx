import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    // Basic dummy auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check localStorage on mount for persistent dummy session
    useEffect(() => {
        const storedAuth = localStorage.getItem('ecovolt_auth');
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
            const storedUser = localStorage.getItem('ecovolt_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username, password) => {
        // Dummy authentication logic
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username === 'admin' && password === 'admin') {
                    const adminUser = { role: 'admin', name: 'System Admin' };
                    setIsAuthenticated(true);
                    setUser(adminUser);
                    localStorage.setItem('ecovolt_auth', 'true');
                    localStorage.setItem('ecovolt_user', JSON.stringify(adminUser));
                    resolve(true);
                } else {
                    reject(new Error('Invalid username or password'));
                }
            }, 800); // Simulate network delay
        });
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
