/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', 'sans-serif'],
        heading: ['"Poppins"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(8, 145, 178, 0.15)',
        'glass-hover': '0 12px 40px 0 rgba(8, 145, 178, 0.25)',
      }
    },
  },
  plugins: [],
}
