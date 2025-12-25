/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#2B7A78',
                secondary: '#3AAFA9',
                accent: '#DEF2F1',
                dark: '#17252A',
                light: '#FEFFFF',
                'admin-primary': '#4F46E5', 
                'admin-secondary': '#7C3AED', 
                'admin-accent': '#EEF2FF',
                'merchant-primary': '#2B7A78',
                'merchant-secondary': '#3AAFA9',
                'muted-foreground': '#6B7280', 
            },
        },
    },
    plugins: [],
};