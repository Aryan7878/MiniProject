/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                space: {
                    900: '#0d0d1a',
                    800: '#12122a',
                    700: '#161630',
                    600: '#1c1c3a',
                },
                violet: {
                    glow: 'rgba(139,92,246,0.25)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-up': 'fade-up 0.5s ease forwards',
                'fade-in': 'fade-in 0.4s ease forwards',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
