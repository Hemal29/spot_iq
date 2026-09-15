/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4fd',
          100: '#dde5fa',
          200: '#bccbf5',
          300: '#93addf',
          400: '#7993df',
          500: '#5f7ad0',
          600: '#4a63b8',
          700: '#3d519a',
          800: '#34447d',
          900: '#2d3a67',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
