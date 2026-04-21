/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-sans)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
        display: ['var(--font-display)', 'sans-serif'],
      },
      colors: {
        background: 'var(--color-background)',
        surface:    'var(--color-surface)',
        border:     'var(--color-border)',
        muted:      'var(--color-muted)',
        subtle:     'var(--color-subtle)',
        foreground: 'var(--color-foreground)',
        accent:     'var(--color-accent)',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px', md: '4px', lg: '6px', xl: '8px',
      },
    },
  },
  plugins: [],
};