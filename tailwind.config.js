/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mainColor: '#fff',
        redColor: '#ff0000',
        greenColor: '#00ff00',
        blueColor: '#0000ff',
        grayLine: '#808080',
    },
    padding: {
      big: '50px',
  },
  screens: {
    sm: '480px',
    md: '768px',
    lg: '1028px',
    xl: '1440px',
  },
  plugins: [],
}
}
}
