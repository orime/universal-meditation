/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'space-mono': ['Space Mono', 'monospace'],
      },
      colors: {
        'space-dark': '#0B0B1F',
        'space-light': '#1A1A2E',
        'stardust': '#E0E0FF',
        'golden': '#FFD700',
        'golden-light': '#FFED4A',
      },
      animation: {
        'float-in': 'floatIn 1s ease-in-out',
        'twinkle': 'twinkle 2s ease-in-out infinite alternate',
      },
      keyframes: {
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        twinkle: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 