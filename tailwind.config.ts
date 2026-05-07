import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        deep:     '#07211c',
        base:     '#0c2a23',
        elevated: '#103a30',
        card:     { DEFAULT: '#144539', hover: '#185143' },
        input:    '#0a2520',
        border: {
          subtle:  'rgba(149,200,175,0.08)',
          DEFAULT: 'rgba(149,200,175,0.14)',
          strong:  'rgba(149,200,175,0.24)',
        },
        mint:  { DEFAULT: '#3eb37c', bright: '#4ed193', soft: 'rgba(62,179,124,0.14)', glow: 'rgba(62,179,124,0.28)' },
        amber: { DEFAULT: '#e8a13c', bright: '#f5b454', soft: 'rgba(232,161,60,0.14)' },
        blue:  { DEFAULT: '#5b9fd6', soft: 'rgba(91,159,214,0.14)' },
        rose:  { DEFAULT: '#d65b6e', soft: 'rgba(214,91,110,0.14)' },
        tx: {
          DEFAULT:   '#f1ede2',
          secondary: '#b8d0c2',
          muted:     '#7a9a8b',
          faint:     '#527063',
        },
        // keep these so existing badge/status components still compile
        accent:  { DEFAULT: '#3eb37c', soft: 'rgba(62,179,124,0.14)' },
        success: { DEFAULT: '#3eb37c', soft: 'rgba(62,179,124,0.14)' },
        danger:  { DEFAULT: '#d65b6e', soft: 'rgba(214,91,110,0.14)' },
        warn:    { DEFAULT: '#e8a13c', soft: 'rgba(232,161,60,0.14)' },
        violet:  { DEFAULT: '#5b9fd6', soft: 'rgba(91,159,214,0.14)' },
        surface: '#07211c',
      },
      fontFamily: {
        sans:    ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5)',
        pop:  '0 24px 48px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(149,200,175,0.1)',
      },
    },
  },
  plugins: [],
}

export default config
