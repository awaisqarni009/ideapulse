import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: 'var(--canvas)',
          deep: 'var(--canvas-deep)',
          solid: 'var(--surface-solid)',
        },
        indigo: {
          DEFAULT: 'var(--indigo)',
          bright: 'var(--indigo-bright)',
          deep: 'var(--indigo-deep)',
        },
        violet: {
          DEFAULT: 'var(--violet)',
          bright: 'var(--violet-bright)',
        },
        cyan: {
          DEFAULT: 'var(--cyan)',
          bright: 'var(--cyan-bright)',
        },
        ink: {
          1: 'var(--text-primary)',
          2: 'var(--text-secondary)',
          3: 'var(--text-tertiary)',
        },
      },
      backdropBlur: { glass: '16px', panel: '24px', overlay: '40px' },
      borderRadius: { xs: '6px', sm: '10px', md: '14px', lg: '20px', xl: '28px' },
      boxShadow: {
        'glow-indigo': 'var(--glow-indigo-md)',
        'glow-violet': 'var(--glow-violet-md)',
        'glow-cyan': 'var(--glow-cyan-md)',
        glass: 'inset 0 1px 0 rgba(255,255,255,.14), 0 8px 24px -8px rgba(0,0,0,.48)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-body)'],
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(.2,0,0,1)',
        out: 'cubic-bezier(.16,1,.3,1)',
      },
    },
  },
  plugins: [],
};

export default config;
