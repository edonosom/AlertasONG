/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: ['w-20', 'bg-white'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--clr-bg)',
        surface: 'var(--clr-surface)',
        'surface-2': 'var(--clr-surface-2)',
        card: 'var(--clr-card)',
        'card-hover': 'var(--clr-card-hover)',
        text: 'var(--clr-text)',
        'text-secondary': 'var(--clr-text-secondary)',
        'text-muted': 'var(--clr-text-muted)',
        border: 'var(--clr-border)',
        'border-accent': 'var(--clr-border-accent)',
        'border-glow': 'var(--clr-border-glow)',
        accent: 'var(--clr-accent)',
        'accent-bright': 'var(--clr-accent-bright)',
        'accent-dark': 'var(--clr-accent-dark)',
        'accent-dim': 'var(--clr-accent-dim)',
        'accent-glow': 'var(--clr-accent-glow)',
        'accent-2': 'var(--clr-accent-2)',
        'accent-2-dim': 'var(--clr-accent-2-dim)',
        'accent-2-glow': 'var(--clr-accent-2-glow)',
        danger: 'var(--clr-danger)',
        'danger-dim': 'var(--clr-danger-dim)',
        'danger-glow': 'var(--clr-danger-glow)',
        success: 'var(--clr-success)',
        'success-dim': 'var(--clr-success-dim)',
        warning: 'var(--clr-warning)',
        'warning-dim': 'var(--clr-warning-dim)',
        'input-bg': 'var(--clr-input-bg)',
        'input-bd': 'var(--clr-input-bd)'
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        glow: 'var(--shadow-glow)',
        'glow-2': 'var(--shadow-glow-2)',
        danger: 'var(--shadow-danger)',
      }
    },
  },
  plugins: [],
}