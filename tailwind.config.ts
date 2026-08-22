import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Kenya Electronics Marketplace brand palette (DESIGN_SYSTEM.md §1)
        copper: {
          50: '#FFF7F2',
          100: '#FEE9D9',
          200: '#FBCD9B',
          300: '#F7A861',
          400: '#F28535',
          500: '#EA6A0C', // PRIMARY
          600: '#C85607',
          700: '#9E4307',
          800: '#743109',
          900: '#4A1E07',
        },
        jade: {
          50: '#F1FBF6',
          100: '#DAF5E6',
          300: '#6ED6A6',
          500: '#12B76A', // SUCCESS / ACCENT
          600: '#029662',
        },
        navy: {
          50: '#F2F5FB',
          100: '#E1E8F5',
          600: '#2C3E6B',
          700: '#1E2C50', // SECONDARY
          900: '#0F172A', // BG DARK
        },
        neutral: {
          0: '#FFFFFF',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          700: '#334155', // BODY TEXT
          900: '#0F172A', // HEADLINE TEXT
        },
        error: {
          '500': '#E11D48',
        },
        warning: {
          '500': '#F59E0B',
        },
        info: {
          '500': '#2563EB',
        },
        whatsapp: {
          '500': '#25D366',
        },
      },
      fontFamily: {
        display: ['var(--font-sora)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // DESIGN_SYSTEM.md §2 type scale keywords
        'display-2xl': ['clamp(2.25rem, 5.5vw + 0.5rem, 3.5rem)', { lineHeight: '1.1', fontWeight: '700' }],
        'display-xl': ['clamp(1.75rem, 4vw + 0.5rem, 2.5rem)', { lineHeight: '1.15', fontWeight: '700' }],
        'display-lg': ['clamp(1.5rem, 3vw + 0.25rem, 2rem)', { lineHeight: '1.2', fontWeight: '700' }],
        'price-lg': ['clamp(1.5rem, 3vw + 0.125rem, 1.75rem)', { lineHeight: '1.2', fontWeight: '700' }],
        'price-sm': ['1.0625rem', { lineHeight: '1.4', fontWeight: '700' }],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
        'full': '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(15,23,42,0.05)',
        sm: '0 2px 6px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        card: '0 4px 16px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.04)',
        lg: '0 12px 32px -8px rgba(15,23,42,0.12), 0 4px 10px rgba(15,23,42,0.05)',
        xl: '0 24px 60px -12px rgba(15,23,42,0.18)',
        cta: '0 10px 24px -6px rgba(234,106,12,0.45)',
      },
      // Semantic tokens (DESIGN_SYSTEM.md §1 Semantic mapping)
      textColor: {
        primary: '#EA6A0C',
        secondary: '#1E2C50',
        success: '#12B76A',
        body: '#334155',
        heading: '#0F172A',
        muted: '#64748B',
        whatsapp: '#25D366',
        error: '#E11D48',
        warning: '#F59E0B',
        info: '#2563EB',
      },
      backgroundColor: {
        primary: '#EA6A0C',
        'primary-hover': '#C85607',
        secondary: '#1E2C50',
        success: '#12B76A',
        surface: '#FFFFFF',
        muted: '#F1F5F9',
        whatsapp: '#25D366',
        error: '#E11D48',
        warning: '#F59E0B',
        info: '#2563EB',
      },
      borderColor: {
        primary: '#EA6A0C',
        secondary: '#1E2C50',
        success: '#12B76A',
        error: '#E11D48',
        warning: '#F59E0B',
        info: '#2563EB',
        whatsapp: '#25D366',
      },
      ringColor: {
        primary: '#F7A861',
        secondary: '#1E2C50',
        success: '#6ED6A6',
        error: '#E11D48',
        warning: '#F59E0B',
        info: '#2563EB',
        whatsapp: '#25D366',
      },
      transitionTimingFunction: {
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      spacing: {
        // DESIGN_SYSTEM.md §3 (8px grid) — multiples provided via key names
        '2': '0.5rem',
      },
    },
  },
  plugins: [],
};

export default config;