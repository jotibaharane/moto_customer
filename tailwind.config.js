// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003049',
          50: '#fdf0d5',
          100: '#eff6ff',
        },
        secondary: {
          DEFAULT: '#f77f00',
          200: '#d62828',
        },
        gray: {
          500: '#6B7280',
        },
        background: {
          DEFAULT: '#fef6f0',
        },
      },
      spacing: {
        14: '3.5rem',
        16: '4rem',
      },
    },
  },
  plugins: [],
};
