/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                surface: {
                    50: '#f0f4f8',
                    100: '#d9e2ec',
                    200: '#bcccdc',
                    300: '#9fb3c8',
                    400: '#627d98',
                    500: '#486581',
                    600: '#334e68',
                    700: '#1e3a4a',
                    800: '#132a3a',
                    900: '#0d1f2d',
                    950: '#080c12',
                },
                waste: { DEFAULT: '#f87171', light: '#fca5a5', dark: '#991b1b' },
                secure: { DEFAULT: '#34d399', light: '#86efac', dark: '#166534' },
                caution: { DEFAULT: '#fbbf24', light: '#fcd34d', dark: '#92400e' },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
                display: ['Orbitron', 'JetBrains Mono', 'monospace'],
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'slide-right': 'slideRight 0.3s ease-out',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'scan': 'scan 4s linear infinite',
                'shimmer': 'animate-shimmer 2s linear infinite',
                'border-pulse': 'borderPulse 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
                slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                slideRight: { from: { opacity: 0, transform: 'translateX(-8px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
                glow: { from: { boxShadow: '0 0 4px rgba(34,211,238,0.15)' }, to: { boxShadow: '0 0 18px rgba(34,211,238,0.3)' } },
                scan: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(100%)' } },
                'animate-shimmer': { from: { backgroundPosition: '0 0' }, to: { backgroundPosition: '-200% 0' } },
                borderPulse: {
                    '0%, 100%': { borderColor: 'rgba(34,211,238,0.08)' },
                    '50%': { borderColor: 'rgba(34,211,238,0.22)' },
                },
            },
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                '.transform-3d': { 'transform-style': 'preserve-3d' },
                '.backface-hidden': { 'backface-visibility': 'hidden' },
            });
        },
    ],
};
