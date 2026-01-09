/** @type {import('tailwindcss').Config} */
const MangoGreen = {
  50: '#f4fbe8',
  100: '#e7f6c7',
  200: '#d1ee98',
  300: '#b8e55f',
  400: '#9edb38',
  500: '#86cc1c',
  600: '#76b900',
  700: '#5f9600',
  800: '#4c7600',
  900: '#3b5b00',
  950: '#223300',
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'base': '14px',
        'lg': '15px',
        'xl': '17px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '30px',
        '5xl': '36px',
        '6xl': '48px',
        '7xl': '60px',
        '8xl': '72px',
      },
      colors: {
        primary: MangoGreen,
        green: MangoGreen,
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
      backgroundColor: {
        'dark': '#000000',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
