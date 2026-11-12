/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'avpro-sky': '#0284c7',
        'theme-accent': '#38bdf8',
        'theme-accent-dark': '#38bdf8',
        'theme-card': '#0f172a',
        'theme-card-dark': '#0f172a',
        'theme-header': '#090d16',
        'theme-header-dark': '#090d16',
        'theme-primary': '#f8fafc',
        'theme-primary-dark': '#f8fafc',
        'theme-secondary': '#94a3b8',
        'theme-secondary-dark': '#94a3b8',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
