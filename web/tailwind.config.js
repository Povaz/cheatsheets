import { STATUS_ACCENTS } from './src/lib/accents.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        paper: '#faf8f5',
        'paper-warm': '#f3efe6',
        ink: '#1a1a1a',
        muted: '#6b6b6b',
        hairline: '#e4e0d9',
        accent: '#c1440e',
        ...STATUS_ACCENTS,
        'status-2xx-soft': '#5a8f3a',
        'status-3xx-soft': '#b97a3e',
        'status-4xx-soft': '#c14545',
        'status-5xx-soft': '#7c66c4',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        serif: ['Fraunces', 'ui-serif', 'serif'],
      },
      fontSize: {
        '2xs': ['10px', '1.4'],
        xs: ['11px', '1.4'],
        sm: ['12px', '1.45'],
        base: ['13px', '1.45'],
      },
      letterSpacing: {
        label: '0.12em',
      },
      screens: {
        cards2: '700px',
        cards3: '1100px',
        cards4: '1400px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.04)',
      },
      borderColor: {
        DEFAULT: '#e4e0d9',
      },
    },
  },
  plugins: [],
}
