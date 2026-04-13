import type { Config } from 'tailwindcss'

export default <Config>{
    content: [
        './pages/**/*.vue',
        './components/**/*.vue',
        './layouts/**/*.vue',
        './plugins/**/*.js',
        './nuxt.config.js',
    ],
    theme: {
        screens: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
        },
    },
    extend: {
        colors: {
            'dark': {
                DEFAULT: '#1c1b22',
                50: '#f8f7fa',
                100: '#eeedf2',
                200: '#d9d8e0',
                300: '#b8b6c4',
                400: '#918fa3',
                500: '#6f6d82',
                600: '#555368',
                700: '#3e3d4d',
                800: '#2a2937',
                900: '#1c1b22',
                950: '#121118',
            },
            tertiary: {
                50: '#f5f3ff',
                100: '#ede9fe',
                200: '#ddd6fe',
                300: '#c4b5fd',
                400: '#a78bfa',
                500: '#8b5cf6',
                600: '#7c3aed',
                700: '#6d28d9',
                800: '#5b21b6',
                900: '#4c1d95',
                950: '#2e1065',
            }
        }
    }
}
