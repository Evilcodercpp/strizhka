/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6F1',
        warm: {
          50: '#FDF8F3',
          100: '#F9EDE0',
          200: '#F0D5B8',
          300: '#E4B88A',
          400: '#D4955A',
          500: '#C47A3A',
          600: '#A8612D',
          700: '#8A4D26',
          800: '#6E3D20',
          900: '#4A2915',
        },
        salon: {
          dark: '#2C1810',
          brown: '#5C3A28',
          gold: '#C9A96E',
          rose: '#C4908A',
          light: '#F5EDE6',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
