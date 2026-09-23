/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette (fixed, theme-independent)
        brand: {
          brown: '#3A2A22',
          deep: '#241812',
          cream: '#EFE6D5',
          orange: '#E8622A',
          blue: '#B4D6E4',
        },
        // Theme-aware tokens, driven by the RGB-channel vars in index.css
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-text': 'rgb(var(--accent-text) / <alpha-value>)',
        'accent-ink': 'rgb(var(--accent-ink) / <alpha-value>)',
        cool: 'rgb(var(--cool) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Fluid editorial scale
        mega: ['clamp(3.25rem, 15vw, 13rem)', { lineHeight: '0.82', letterSpacing: '-0.04em' }],
        display: ['clamp(2rem, 5.5vw, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        section: ['clamp(1.75rem, 4vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
      },
      maxWidth: {
        measure: '62ch',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translate3d(0,0,0)' },
          to: { transform: 'translate3d(-50%,0,0)' },
        },
        // Slow organic "breathing" of the events blob.
        blob: {
          '0%, 100%': { borderRadius: '58% 42% 55% 45% / 48% 58% 42% 52%', transform: 'rotate(0deg) scale(1)' },
          '33%': { borderRadius: '44% 56% 40% 60% / 58% 44% 56% 42%', transform: 'rotate(4deg) scale(1.03)' },
          '66%': { borderRadius: '52% 48% 62% 38% / 42% 54% 46% 58%', transform: 'rotate(-3deg) scale(0.98)' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        blob: 'blob 16s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
