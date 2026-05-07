import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f1419',
        card: { DEFAULT: '#1a2028', hover: '#222a35' },
        border: { DEFAULT: '#2a3441', strong: '#3a4553' },
        tx: { DEFAULT: '#e6edf3', dim: '#8b96a5', faint: '#5a6573' },
        accent: { DEFAULT: '#6ea8fe', soft: 'rgba(110,168,254,0.12)' },
        success: { DEFAULT: '#3fb950', soft: 'rgba(63,185,80,0.12)' },
        danger:  { DEFAULT: '#f85149', soft: 'rgba(248,81,73,0.12)' },
        warn:    { DEFAULT: '#d29922', soft: 'rgba(210,153,34,0.15)' },
        violet:  { DEFAULT: '#a371f7', soft: 'rgba(163,113,247,0.12)' },
      },
      fontFamily: {
        sans:    ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        display: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
