/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'zoom-slow': 'zoom 20s ease-in-out infinite',
        'float-1': 'float 6s ease-in-out infinite',
        'float-2': 'float 8s ease-in-out infinite 2s',
        'float-3': 'float 10s ease-in-out infinite 1s',
        'float-4': 'float 7s ease-in-out infinite 3s',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-text': 'glowText 3s ease-in-out infinite alternate',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'pulse-medium': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'scroll': 'scroll 2s infinite',
      },
      keyframes: {
        zoom: {
          '0%, 100%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
        },
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        glowText: {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scroll: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(10px)', opacity: '0' },
        },
      },
      colors: {
        primary: {
          50: '#f7f8fb',
          100: '#eef0f7',
          200: '#d7daec',
          300: '#b3bbdb',
          400: '#8793c5',
          500: '#5e6cad',
          600: '#485695',
          700: '#3b467a',
          800: '#333b65',
          900: '#2d3455',
        },
        gold: '#FFD700',
        'gold-light': '#F4E4BC',
        'gold-dark': '#B8860B',
        blush: '#f6d7d4',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        'sans': ['Cormorant Garamond', 'Georgia', 'serif'],
        'serif': ['Cormorant Garamond', 'Georgia', 'serif'],
        'script': ['Dancing Script', 'cursive'],
        'brush': ['"Dancing Script"', 'cursive'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
