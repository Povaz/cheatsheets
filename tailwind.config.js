/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        paper: '#faf8f5',
        ink: '#1a1a1a',
        muted: '#6b6b6b',
        hairline: '#e4e0d9',
        accent: '#c1440e',
        'status-2xx': '#2d5016',
        'status-3xx': '#8b4513',
        'status-4xx': '#7f1d1d',
        'status-5xx': '#4b3680',
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
