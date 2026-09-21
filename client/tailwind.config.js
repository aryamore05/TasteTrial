/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF5F0',
          100: '#FFE8DC',
          200: '#FFD1B8',
          300: '#FFAA85',
          400: '#FF8A54',
          500: '#FF6B35', // Primary Color requested
          600: '#E8531D',
          700: '#C23E11',
          800: '#9B3310',
          900: '#7C2D12',
        },
        slateDark: '#1F2937', // Secondary Color requested
        bgLight: '#F9FAFB',   // Background Color requested
        textMain: '#111827',  // Text Color requested
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
