/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // Breakpoints personalizados para dispositivos específicos
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Breakpoints para orientação
        'portrait': {'raw': '(orientation: portrait)'},
        'landscape': {'raw': '(orientation: landscape)'},
        // Breakpoints para touch
        'touch': {'raw': '(hover: none) and (pointer: coarse)'},
        'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
      },
      
      // Heights específicos para mobile
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'header': '3.5rem',
        'nav': '4rem',
      },
      
      // Grid templates responsivos
      gridTemplateColumns: {
        'auto-fit-300': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fill-250': 'repeat(auto-fill, minmax(250px, 1fr))',
        'responsive-cards': 'repeat(auto-fit, minmax(280px, 1fr))',
        'responsive-table': 'repeat(auto-fit, minmax(150px, 1fr))',
      },
      
      // Box shadows otimizadas para mobile
      boxShadow: {
        'mobile': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'mobile-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'touch': '0 0 0 3px rgba(59, 130, 246, 0.5)',
      },
    },
  },
  plugins: [],
}