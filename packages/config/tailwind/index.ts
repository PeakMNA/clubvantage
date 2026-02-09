import type { Config } from 'tailwindcss';

export const clubvantagePreset: Config = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors: {
        // ============================================
        // ClubVantage Design System
        // Primary: Amber (warm, inviting, premium)
        // Secondary: Emerald (fresh, natural, growth)
        // Neutral: Stone (warm grays, sophisticated)
        // ============================================

        // Primary Brand Colors (Amber)
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: 'hsl(48, 100%, 96%)',
          100: 'hsl(48, 96%, 89%)',
          200: 'hsl(48, 97%, 77%)',
          300: 'hsl(46, 97%, 65%)',
          400: 'hsl(43, 96%, 56%)',
          500: 'hsl(38, 92%, 50%)',
          600: 'hsl(32, 95%, 44%)',
          700: 'hsl(26, 90%, 37%)',
          800: 'hsl(23, 83%, 31%)',
          900: 'hsl(22, 78%, 26%)',
          950: 'hsl(21, 92%, 14%)',
        },

        // Secondary Colors (Emerald)
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: 'hsl(152, 81%, 96%)',
          100: 'hsl(149, 80%, 90%)',
          200: 'hsl(152, 76%, 80%)',
          300: 'hsl(156, 72%, 67%)',
          400: 'hsl(158, 64%, 52%)',
          500: 'hsl(160, 84%, 39%)',
          600: 'hsl(161, 94%, 30%)',
          700: 'hsl(163, 94%, 24%)',
          800: 'hsl(163, 88%, 20%)',
          900: 'hsl(164, 86%, 16%)',
          950: 'hsl(166, 91%, 9%)',
        },

        // Accent Colors (Amber darker for contrast)
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        // Neutral Colors (Stone - warm grays)
        stone: {
          50: 'hsl(60, 9%, 98%)',
          100: 'hsl(60, 5%, 96%)',
          200: 'hsl(20, 6%, 90%)',
          300: 'hsl(24, 6%, 83%)',
          400: 'hsl(24, 5%, 64%)',
          500: 'hsl(25, 5%, 45%)',
          600: 'hsl(33, 5%, 32%)',
          700: 'hsl(30, 6%, 25%)',
          800: 'hsl(12, 6%, 15%)',
          900: 'hsl(24, 10%, 10%)',
          950: 'hsl(20, 14%, 4%)',
        },

        // Semantic Colors
        success: {
          DEFAULT: 'hsl(160, 84%, 39%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        warning: {
          DEFAULT: 'hsl(38, 92%, 50%)',
          foreground: 'hsl(22, 78%, 26%)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        info: {
          DEFAULT: 'hsl(199, 89%, 48%)',
          foreground: 'hsl(0, 0%, 100%)',
        },

        // Status Colors (Member Status)
        status: {
          active: 'hsl(160, 84%, 39%)',      // Emerald - healthy, active
          suspended: 'hsl(38, 92%, 50%)',     // Amber - warning, attention
          lapsed: 'hsl(0, 84%, 60%)',         // Red - critical
          pending: 'hsl(199, 89%, 48%)',      // Blue - processing
        },

        // Background & Surface (Stone-based)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Sidebar
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        // Warm amber glow for primary actions
        'amber-sm': '0 1px 3px 0 hsl(38 92% 50% / 0.1)',
        'amber-md': '0 4px 6px -1px hsl(38 92% 50% / 0.15)',
        'amber-lg': '0 10px 15px -3px hsl(38 92% 50% / 0.2)',
        // Emerald glow for success states
        'emerald-sm': '0 1px 3px 0 hsl(160 84% 39% / 0.1)',
        'emerald-md': '0 4px 6px -1px hsl(160 84% 39% / 0.15)',
        // Inner shadow for depth
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.2s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.2s ease-out',
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
};

export default clubvantagePreset;
