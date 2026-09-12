/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // App background and surfaces (Reference Image)
        'bg-base': '#0D0D0F',
        'bg-surface': '#17171A',
        'bg-surface-raised': '#1E1E22',
        'bg-active': '#241C16',

        // Borders
        'border-subtle': '#2A2A2E',
        'border-strong': '#38383D',

        // Typography
        'text-primary': '#F5F5F4',
        'text-secondary': '#A3A3A8',
        'text-muted': '#6B6B70',

        // Restrained Brand Accent (Orange)
        'accent-orange': '#E8672E',
        'accent-orange-hover': '#F3773D',
        'accent-orange-muted': '#3A2318',

        // Semantic Colors
        'success-green': '#3FB65F',
        'success-bg': '#16261B',
        'warning-amber': '#D89A3E',
        'warning-bg': '#2B2213',
        'error-red': '#E0554E',
        'error-bg': '#2A1717',
        'info-blue': '#4C8DDA',
        'info-bg': '#16202B',

        // Keep standard gray mappings tuned to charcoal
        gray: {
          950: '#0D0D0F',
          900: '#17171A',
          850: '#1A1A1E',
          800: '#1E1E22',
          700: '#2A2A2E',
          600: '#38383D',
          500: '#6B6B70',
          400: '#A3A3A8',
          300: '#D4D4D8',
          200: '#E4E4E7',
          100: '#F5F5F4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
