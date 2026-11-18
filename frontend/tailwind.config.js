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
        dark: {
          900: '#09090B',
          800: '#111113',
          700: '#151518',
          600: '#18181B',
          500: '#1C1C20',
          border: '#27272A',
        },
        accent: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          green: '#10B981',
          red: '#EF4444',
          amber: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
