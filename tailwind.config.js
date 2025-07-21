import daisyui from 'daisyui';

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      keyframes: {
        // More organic, random, and unique float paths for each ball
        'float-primary': {
          '0%, 100%': { top: '8vh', left: '6vw', transform: 'translate(0, 0)' },
          '15%': { top: '12vh', left: '30vw', transform: 'translate(10px, -20px)' },
          '32%': { top: '18vh', left: '12vw', transform: 'translate(-15px, 30px)' },
          '48%': { top: '22vh', left: '45vw', transform: 'translate(20px, 10px)' },
          '65%': { top: '10vh', left: '60vw', transform: 'translate(-10px, -25px)' },
          '80%': { top: '5vh', left: '35vw', transform: 'translate(0, 0)' },
        },
        'float-secondary': {
          '0%, 100%': { bottom: '7vh', right: '8vw', transform: 'translate(0, 0)' },
          '18%': { bottom: '20vh', right: '25vw', transform: 'translate(-10px, 15px)' },
          '36%': { bottom: '12vh', right: '50vw', transform: 'translate(20px, -10px)' },
          '54%': { bottom: '30vh', right: '18vw', transform: 'translate(-15px, 20px)' },
          '72%': { bottom: '15vh', right: '60vw', transform: 'translate(10px, -20px)' },
          '90%': { bottom: '5vh', right: '35vw', transform: 'translate(0, 0)' },
        },
        'float-accent': {
          '0%, 100%': { top: '12vh', right: '12vw', transform: 'translate(0, 0)' },
          '14%': { top: '25vh', right: '30vw', transform: 'translate(-20px, 10px)' },
          '29%': { top: '18vh', right: '55vw', transform: 'translate(15px, -15px)' },
          '43%': { top: '35vh', right: '20vw', transform: 'translate(-10px, 20px)' },
          '57%': { top: '10vh', right: '65vw', transform: 'translate(20px, 10px)' },
          '71%': { top: '8vh', right: '40vw', transform: 'translate(0, 0)' },
        },
        'float-base': {
          '0%, 100%': { bottom: '10vh', left: '10vw', transform: 'translate(0, 0)' },
          '20%': { bottom: '28vh', left: '22vw', transform: 'translate(10px, -10px)' },
          '38%': { bottom: '15vh', left: '48vw', transform: 'translate(-20px, 20px)' },
          '56%': { bottom: '32vh', left: '15vw', transform: 'translate(15px, -15px)' },
          '74%': { bottom: '12vh', left: '65vw', transform: 'translate(-10px, 10px)' },
          '92%': { bottom: '8vh', left: '38vw', transform: 'translate(0, 0)' },
        },
        'float-alt1': {
          '0%, 100%': { top: '55vh', left: '15vw', transform: 'translate(0, 0)' },
          '13%': { top: '65vh', left: '28vw', transform: 'translate(10px, 10px)' },
          '27%': { top: '70vh', left: '45vw', transform: 'translate(-10px, -20px)' },
          '41%': { top: '60vh', left: '60vw', transform: 'translate(20px, 10px)' },
          '59%': { top: '75vh', left: '70vw', transform: 'translate(-20px, 20px)' },
          '77%': { top: '58vh', left: '50vw', transform: 'translate(0, 0)' },
        },
        'float-alt2': {
          '0%, 100%': { bottom: '55vh', right: '15vw', transform: 'translate(0, 0)' },
          '17%': { bottom: '65vh', right: '28vw', transform: 'translate(-10px, 10px)' },
          '33%': { bottom: '70vh', right: '45vw', transform: 'translate(10px, -20px)' },
          '49%': { bottom: '60vh', right: '60vw', transform: 'translate(-20px, 10px)' },
          '67%': { bottom: '75vh', right: '70vw', transform: 'translate(20px, 20px)' },
          '85%': { bottom: '58vh', right: '50vw', transform: 'translate(0, 0)' },
        },
        'float-alt3': {
          '0%, 100%': { top: '60vh', right: '18vw', transform: 'translate(0, 0)' },
          '11%': { top: '70vh', right: '32vw', transform: 'translate(10px, -10px)' },
          '23%': { top: '80vh', right: '55vw', transform: 'translate(-10px, 20px)' },
          '37%': { top: '65vh', right: '20vw', transform: 'translate(20px, -10px)' },
          '53%': { top: '78vh', right: '65vw', transform: 'translate(-20px, 10px)' },
          '69%': { top: '62vh', right: '40vw', transform: 'translate(0, 0)' },
        },
        'float-alt4': {
          '0%, 100%': { bottom: '60vh', left: '18vw', transform: 'translate(0, 0)' },
          '16%': { bottom: '70vh', left: '32vw', transform: 'translate(-10px, -10px)' },
          '31%': { bottom: '80vh', left: '55vw', transform: 'translate(10px, 20px)' },
          '47%': { bottom: '65vh', left: '20vw', transform: 'translate(-20px, -10px)' },
          '63%': { bottom: '78vh', left: '65vw', transform: 'translate(20px, -20px)' },
          '79%': { bottom: '62vh', left: '40vw', transform: 'translate(0, 0)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '0.15' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        // Only keep the combined float-pulse-subtle animations that are used
        'float-primary-pulse-subtle': 'float-primary 18s ease-in-out infinite, pulse-subtle 4s cubic-bezier(0.1, 0.3, 0, .1) infinite',
        'float-secondary-pulse-subtle': 'float-secondary 22s ease-in-out infinite, pulse-subtle 4s cubic-bezier(0.1, 0.3, 0, .1) infinite',
        'float-accent-pulse-subtle': 'float-accent 16s ease-in-out infinite, pulse-subtle 4s cubic-bezier(0.1, 0.3, 0, .1) infinite',
        'float-base-pulse-subtle': 'float-base 20s ease-in-out infinite, pulse-subtle 4s cubic-bezier(0.1, 0.3, 0, .1) infinite',
        'float-alt1-pulse-subtle': 'float-alt1 24s ease-in-out infinite, pulse-subtle 4s cubic-bezier(0.1, 0.3, 0, .1) infinite',
        'float-alt2-pulse-subtle': 'float-alt2 28s ease-in-out infinite, pulse-subtle 4s cubic-bezier(0.1, 0.3, 0, .1) infinite',
        'float-alt3-pulse-subtle': 'float-alt3 20s ease-in-out infinite, pulse-subtle 4s cubic-bezier(0.1, 0.3, 0, .1) infinite',
        'float-alt4-pulse-subtle': 'float-alt4 26s ease-in-out infinite, pulse-subtle 4s cubic-bezier(0.1, 0.3, 0, .1) infinite',
      },
      animationDelay: {
        '0': '0ms',
        '500': '500ms',
        '1000': '1000ms',
        '1500': '1500ms',
        '2000': '2000ms',
        '2500': '2500ms',
        '3000': '3000ms',
        '3500': '3500ms',
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