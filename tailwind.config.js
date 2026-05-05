/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hospital: {
          primary: '#0ea5e9',
          secondary: '#f0f9ff',
          text: '#0c4a6e',
        },
        food: {
          primary: '#f97316',
          secondary: '#fff7ed',
          text: '#7c2d12',
        },
        electricity: {
          primary: '#eab308',
          secondary: '#fefce8',
          text: '#713f12',
        },
        water: {
          primary: '#3b82f6',
          secondary: '#eff6ff',
          text: '#1e3a8a',
        },
      },
      fontFamily: {
        receipt: ['Courier New', 'Courier', 'monospace'],
        modern: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
