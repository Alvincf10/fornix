/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0f172a',
          muted: '#475569',
          faint: '#94a3b8',
        },
        paper: {
          DEFAULT: '#f8fafc',
          raised: '#ffffff',
          line: '#e2e8f0',
        },
        accent: {
          DEFAULT: '#3730a3',
          strong: '#312e81',
          soft: '#e0e7ff',
        },
      },
      fontFamily: {
        sans: ['"Geist Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        control: '0.375rem',
        panel: '0.5rem',
      },
      boxShadow: {
        panel: '0 1px 2px rgb(15 23 42 / 0.06)',
      },
    },
  },
  plugins: [],
};
