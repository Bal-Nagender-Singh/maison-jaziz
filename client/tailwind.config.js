/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#130e0d', ivory: '#fbf6e9', cream: '#f3ead6', sand: '#ded0b9', taupe: '#9c8a73', maroon: '#4b0d19', wine: '#701b2b', gold: '#c39a43', antique: '#9f762d', champagne: '#e3c77d' },
      fontFamily: { display: ['Cormorant Garamond', 'Georgia', 'serif'], royal: ['Cinzel', 'Georgia', 'serif'], sans: ['Manrope', 'Arial', 'sans-serif'] },
      letterSpacing: { luxury: '.22em' },
      boxShadow: { soft: '0 24px 70px rgba(30,25,18,.10)', royal: '0 22px 60px rgba(57,13,23,.16)', glow: '0 10px 38px rgba(195,154,67,.24)' }
    }
  },
  plugins: []
};
