/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Segoe UI"', 'Inter', 'Arial', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                soil: {
                    green: '#2e7d32',
                    'green-dark': '#1b5e20',
                    'green-light': '#4caf50',
                    lime: '#6bbf59',
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.8s ease forwards',
                slideUp: 'slideUp 0.8s ease forwards',
                float: 'float 6s ease-in-out infinite',
                'float-delayed': 'float 8s ease-in-out 2s infinite',
                'glow-pulse': 'glow-pulse 2s infinite ease-in-out',
                'bounce-dot': 'bounce-dot 1.4s ease-in-out infinite',
                'fab-pulse': 'fab-pulse 2s ease-in-out infinite',
                spin: 'spin 1s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'glow-pulse': {
                    '0%': { boxShadow: '0 0 5px rgba(46, 125, 50, 0.2)' },
                    '50%': { boxShadow: '0 0 20px rgba(46, 125, 50, 0.5)' },
                    '100%': { boxShadow: '0 0 5px rgba(46, 125, 50, 0.2)' },
                },
                'bounce-dot': {
                    '0%, 80%, 100%': { transform: 'scale(0)' },
                    '40%': { transform: 'scale(1)' },
                },
                'fab-pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.5)' },
                    '70%': { boxShadow: '0 0 0 12px rgba(46, 125, 50, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(46, 125, 50, 0)' },
                },
                modalSlideUp: {
                    from: { transform: 'translateY(30px)', opacity: '0' },
                    to: { transform: 'translateY(0)', opacity: '1' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
