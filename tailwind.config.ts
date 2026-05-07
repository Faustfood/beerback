import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Beerback Brand
        bg: '#faf6f0',
        'bg-card': '#ffffff',
        'bg-deep': '#0f0a08',
        ink: '#1a1410',
        'ink-soft': '#6b5b4f',
        gold: {
          DEFAULT: '#d4a017',
          light: '#f4d97a',
          deep: '#8b5e0f',
        },
        foam: '#fff8e7',
        line: 'rgba(26, 20, 16, 0.08)',
      },
      fontFamily: {
        display: ['var(--font-bricolage)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'pulse-ring': 'pulseRing 2s ease-out infinite',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
