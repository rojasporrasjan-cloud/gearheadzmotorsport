/** @type {import('tailwindcss').Config} */
export default {
  content: ['./*.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        red:   '#E8001C',
        ink:   '#0C0C0C',
        card:  '#161616',
        line:  '#252525',
        muted: '#777777',
        snow:  '#F2F2F2',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
