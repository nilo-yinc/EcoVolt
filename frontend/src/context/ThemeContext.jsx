import { createContext, useContext, useMemo, useState, useEffect } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'ww-theme';
const BACKGROUND_STORAGE_KEY = 'ww-background-mode';
const prefersDarkQuery = '(prefers-color-scheme: dark)';

function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
        return saved;
    }

    return window.matchMedia(prefersDarkQuery).matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);
    const [backgroundMode, setBackgroundMode] = useState(() => {
        const saved = localStorage.getItem(BACKGROUND_STORAGE_KEY);
        return saved === 'shader' ? 'shader' : 'cctv';
    });

    useEffect(() => {
        const root = document.documentElement;

        root.classList.toggle('dark', theme === 'dark');
        root.setAttribute('data-theme', theme);
        root.style.colorScheme = theme;
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-background', backgroundMode);
        localStorage.setItem(BACKGROUND_STORAGE_KEY, backgroundMode);
    }, [backgroundMode]);

    useEffect(() => {
        const media = window.matchMedia(prefersDarkQuery);
        const updateTheme = (event) => {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'light' || saved === 'dark') {
                return;
            }

            setTheme(event.matches ? 'dark' : 'light');
        };

        media.addEventListener('change', updateTheme);
        return () => media.removeEventListener('change', updateTheme);
    }, []);

    const toggleTheme = () => {
        setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
    };
    const toggleBackgroundMode = () => {
        setBackgroundMode((current) => (current === 'cctv' ? 'shader' : 'cctv'));
    };

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            toggleTheme,
            backgroundMode,
            setBackgroundMode,
            toggleBackgroundMode,
            isDark: theme === 'dark',
        }),
        [theme, backgroundMode],
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
