/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        'paper-warm': 'rgb(var(--c-paper-warm) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        hairline: 'rgb(var(--c-hairline) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        overlay: 'rgb(var(--c-overlay-rgb) / var(--overlay-alpha))',
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
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'popover-up': 'var(--shadow-popover-up)',
      },
      borderColor: {
        DEFAULT: 'rgb(var(--c-hairline) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
