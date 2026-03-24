/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        purple: {
          50:  '#f8f6fb',
          100: '#ede9f4',
          200: '#d9d0ea',
          300: '#bcaed8',
          400: '#9b85c0',
          500: '#7d63a8',
          600: '#664d8e',
          700: '#533d74',
          800: '#45325f',
          900: '#2e2040',
          950: '#1a1228',
        },
      },
    },
  },
  plugins: [],
};
