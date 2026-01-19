/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#667eea',
                    light: '#a5b4fc',
                    dark: '#4f46e5'
                },
                secondary: {
                    DEFAULT: '#38ef7d',
                    dark: '#11998e'
                },
                dark: {
                    900: '#0f0f1a',
                    800: '#1a1a2e',
                    700: '#1e1e32',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 2s linear infinite',
            }
        },
    },
    plugins: [],
}
