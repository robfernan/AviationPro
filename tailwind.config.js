/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'avpro-red': '#FE0909',
        'theme-accent': '#FE0909',
        'theme-accent-dark': '#FE0909',
        'theme-card': '#ffffff',
        'theme-card-dark': '#1e293b',
        'theme-header': '#f1f5f9',
        'theme-header-dark': '#0f172a',
        'theme-primary': '#0f172a',
        'theme-primary-dark': '#e2e8f0',
        'theme-secondary': '#64748b',
        'theme-secondary-dark': '#94a3b8',
      },
    },
  },
  plugins: [],
};
