/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          teal: {
            50: '#F0FDFA',
            100: '#CCFBF1',
            200: '#99F6E4',
            500: '#14B8A6',
            600: '#0D9488',
            700: '#0F766E',
            800: '#115E59',
            900: '#134E4A',
          },
          slate: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          },
          coral: {
            50: '#FFF1F2',
            100: '#FFE4E6',
            500: '#F43F5E',
            600: '#E11D48',
            700: '#BE123C',
          },
          amber: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
          },
          emerald: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
          },
          ink: {
            DEFAULT: '#0F172A',
            secondary: '#334155',
            muted: '#64748B',
            subtle: '#94A3B8',
          },
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'apple-card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'apple-hover': '0 4px 12px 0 rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)',
        'apple-elevated': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'apple-modal': '0 20px 40px -10px rgba(15, 23, 42, 0.15), 0 10px 20px -5px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        'apple-xl': '14px',
        'apple-2xl': '18px',
      },
    },
  },
  plugins: [],
};
