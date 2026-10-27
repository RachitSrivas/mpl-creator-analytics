/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mpl: {
          red: '#ED1B24',
          darkred: '#C2131B',
          navy: '#0B1120',
          card: '#131B2E',
          cardHover: '#1A243D',
          border: '#1E293B',
          text: '#F1F5F9',
          muted: '#94A3B8',
          accent: '#FF4757',
        }
      }
    },
  },
  plugins: [],
}
