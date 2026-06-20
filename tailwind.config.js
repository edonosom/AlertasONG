/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#e0f2f1',
          100: '#b2dfdb',
          200: '#80cbc4',
          300: '#4db6ac',
          400: '#26a69a',
          500: '#008880',
          600: '#008880', // Default Brand Teal
          700: '#136962', // Darker Teal
          800: '#1b2b29', // Almost black
          900: '#101a18',
        },
        pink: {
          400: '#4db6ac',
          500: '#136962', // Dark Teal for gradient 'to-pink-500'
          600: '#1b2b29',
        }
      }
    },
  },
  plugins: [],
}
