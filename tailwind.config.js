/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        green: {
          darkest: '#0d2418',
          dark: '#143a24',
          main: '#1f5e3a',
          mid: '#2a7a4b',
          bright: '#3d9e63',
          light: '#e8f0e8',
          pale: '#f0f7f0',
        },
        gold: {
          dark: '#8a6a2f',
          DEFAULT: '#b38b4d',
          mid: '#d4a860',
          light: '#f7e9c3',
          pale: '#fdf6e3',
        },
        cream: { DEFAULT: '#faf8f4', dark: '#f2ede4' },
      },
      fontFamily: {
        amiri: ['Amiri', 'serif'],
        merriweather: ['Merriweather', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};