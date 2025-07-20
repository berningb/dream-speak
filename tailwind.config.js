import daisyui from 'daisyui';

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-30px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(30px)' },
        },
        'float-diagonal': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(20px, -20px)' },
          '50%': { transform: 'translate(-20px, -40px)' },
          '75%': { transform: 'translate(-20px, 20px)' },
        },
        'float-circular': {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(20px, -20px)' },
          '50%': { transform: 'translate(40px, 0)' },
          '75%': { transform: 'translate(20px, 20px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        'float-wavy': {
          '0%, 100%': { transform: 'translateY(0)' },
          '20%': { transform: 'translateY(-10px)' },
          '40%': { transform: 'translateY(10px)' },
          '60%': { transform: 'translateY(-10px)' },
          '80%': { transform: 'translateY(10px)' },
        },
        'subtle-float': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '20%': { transform: 'translate(10px, -8px)' },
          '40%': { transform: 'translate(-8px, 12px)' },
          '60%': { transform: 'translate(-12px, -6px)' },
          '80%': { transform: 'translate(8px, 10px)' },
        },
        'float-primary': {
          '0%, 100%': { top: '100px', left: '0px' },
          '25%': { top: '80px', left: '20px' },
          '50%': { top: '120px', left: '-10px' },
          '75%': { top: '90px', left: '-20px' },
        },
        'float-secondary': {
          '0%, 100%': { bottom: '100px', right: '0px' },
          '25%': { bottom: '120px', right: '20px' },
          '50%': { bottom: '80px', right: '-10px' },
          '75%': { bottom: '110px', right: '-20px' },
        },
        'float-accent': {
          '0%, 100%': { top: '200px', right: '0px' },
          '25%': { top: '180px', right: '20px' },
          '50%': { top: '220px', right: '-10px' },
          '75%': { top: '190px', right: '-20px' },
        },
        'float-base': {
          '0%, 100%': { bottom: '200px', left: '0px' },
          '25%': { bottom: '220px', left: '20px' },
          '50%': { bottom: '180px', left: '-10px' },
          '75%': { bottom: '210px', left: '-20px' },
        },
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 12s ease-in-out infinite',
        'float-medium': 'float 5s ease-in-out infinite',
        'float-medium-reverse': 'float-reverse 5s ease-in-out infinite',
        'float-diagonal': 'float-diagonal 9s ease-in-out infinite',
        'float-circular': 'float-circular 11s linear infinite',
        'float-wavy': 'float-wavy 7s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.2, 0, 0.4, .6) infinite',
        'subtle-float': 'subtle-float 8s ease-in-out infinite',
        'float-primary': 'float-primary 8s ease-in-out infinite',
        'float-secondary': 'float-secondary 10s ease-in-out infinite',
        'float-accent': 'float-accent 7s ease-in-out infinite',
        'float-base': 'float-base 9s ease-in-out infinite',
      },
    },
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: [
      "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"
    ],
  },
}; 