/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdfaf0',
          100: '#f9f0d7',
          200: '#f3e0ae',
          300: '#eccd7f',
          400: '#e7c588',
          500: '#d9a94f',
          600: '#bf8a2e',
          700: '#9c6e24',
          800: '#7a5620',
          900: '#3d2f14',
        },
        noir: {
          950: '#0a0a0b',
          900: '#121214',
          800: '#1c1c1f',
          700: '#2a2a2e',
        },
        gold: {
          DEFAULT: '#e7c588',
          light: '#f3e0ae',
          dark: '#bf8a2e',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
