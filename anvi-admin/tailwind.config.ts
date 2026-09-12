import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        anvi: {
          maroon: {
            DEFAULT: '#5B1727',
            hover: '#48111E',
            light: '#7A2237',
            dark: '#420f1b',
            soft: '#FBF2F4',
          },
          gold: {
            DEFAULT: '#D4B27C',
            accent: '#9E7D3B',
            light: '#EAD7B5',
            dark: '#85662B',
            soft: '#FDF9F0',
          },
          ivory: '#FAF7F2',
          beige: '#F1E8DC',
          charcoal: {
            DEFAULT: '#2F2B2B',
            surface: '#221D1E',
            text: '#2F2B2B',
            muted: '#706B6B',
          },
          linen: {
            DEFAULT: '#FAF7F2',
            card: '#FFFFFF',
            border: '#E8E2D9',
            subtle: '#F1E8DC',
          },
          sand: {
            DEFAULT: '#E8E2D9',
            light: '#FAF7F2',
            dark: '#D8CFBF',
          },
          muted: '#706B6B',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(47, 43, 43, 0.04), 0 1px 2px rgba(47, 43, 43, 0.02)',
        card: '0 4px 20px rgba(91, 23, 39, 0.04)',
        'luxury-subtle': '0 2px 10px rgba(91, 23, 39, 0.04), 0 1px 3px rgba(47, 43, 43, 0.03)',
        'luxury-card': '0 10px 30px rgba(91, 23, 39, 0.06), 0 1px 4px rgba(47, 43, 43, 0.04)',
        dropdown: '0 10px 30px rgba(91, 23, 39, 0.08)',
        modal: '0 20px 48px rgba(91, 23, 39, 0.16)',
      },
    },
  },
  plugins: [],
} satisfies Config;
