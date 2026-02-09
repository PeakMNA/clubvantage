import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // ============================================
      // ClubVantage Marketing - "Refined Editorial Luxury"
      // Sophisticated elegance for premium clubs
      // Primary: Forest Green | Accent: Warm Gold
      // ============================================
      colors: {
        // Primary Brand - Deep Forest Green
        primary: {
          DEFAULT: '#1B4332',
          50: '#F0F5F3',
          100: '#D8E9E0',
          200: '#B1D3C1',
          300: '#74A98C',
          400: '#3D7E5C',
          500: '#1B4332',
          600: '#163828',
          700: '#112B1F',
          800: '#0B1D15',
          900: '#060F0A',
        },

        // Accent - Warm Antique Gold
        accent: {
          DEFAULT: '#B8860B',
          50: '#FDF8E8',
          100: '#F9EEC4',
          200: '#EDCE6D',
          300: '#D4A83A',
          400: '#B8860B',
          500: '#9A7009',
          600: '#7C5A07',
          700: '#5E4405',
          800: '#3F2E04',
          900: '#211702',
        },

        // Warm Cream Backgrounds
        cream: {
          DEFAULT: '#FAF7F2',
          50: '#FFFFFF',
          100: '#FAF7F2',
          200: '#F5EFE6',
          300: '#EBE3D5',
          400: '#D9CDB8',
          500: '#C7B79A',
        },

        // Rich Charcoal for Text
        charcoal: {
          DEFAULT: '#1C1917',
          50: '#F5F5F4',
          100: '#E7E5E4',
          200: '#D6D3D1',
          300: '#A8A29E',
          400: '#78716C',
          500: '#57534E',
          600: '#44403C',
          700: '#292524',
          800: '#1C1917',
          900: '#0C0A09',
        },

        // Semantic Colors
        success: {
          DEFAULT: '#059669',
          50: '#ECFDF5',
          500: '#059669',
          600: '#047857',
        },
        error: {
          DEFAULT: '#DC2626',
          50: '#FEF2F2',
          500: '#DC2626',
          600: '#B91C1C',
        },
        warning: {
          DEFAULT: '#D97706',
          50: '#FFFBEB',
          500: '#D97706',
        },
      },

      fontFamily: {
        // Elegant serif for headlines (with Thai fallback)
        serif: ['var(--font-serif)', 'var(--font-serif-thai)', 'Georgia', 'Times New Roman', 'serif'],
        // Modern refined sans for body (with Thai fallback)
        sans: ['var(--font-sans)', 'var(--font-sans-thai)', 'system-ui', 'sans-serif'],
        // Monospace for technical elements
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        // Display - Editorial Statement (responsive with clamp)
        'display-xl': ['clamp(2.75rem, 5vw + 1rem, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '500' }],
        display: ['clamp(2.25rem, 4vw + 0.75rem, 3.75rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '500' }],
        // Headings (responsive with clamp)
        h1: ['clamp(1.875rem, 2.5vw + 0.75rem, 3rem)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '500' }],
        h2: ['clamp(1.5rem, 2vw + 0.5rem, 2.25rem)', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '500' }],
        h3: ['clamp(1.25rem, 1.5vw + 0.375rem, 1.5rem)', { lineHeight: '1.3', fontWeight: '600' }],
        h4: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        // Body (slightly larger for Thai readability)
        'body-xl': ['clamp(1.125rem, 1vw + 0.5rem, 1.25rem)', { lineHeight: '1.75' }],
        'body-lg': ['clamp(1rem, 0.75vw + 0.5rem, 1.125rem)', { lineHeight: '1.75' }],
        body: ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        // Labels & Captions
        label: ['0.8125rem', { lineHeight: '1', letterSpacing: '0.1em', fontWeight: '500' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },

      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      boxShadow: {
        sm: '0 1px 2px rgba(28, 25, 23, 0.04)',
        DEFAULT: '0 4px 12px rgba(28, 25, 23, 0.06)',
        md: '0 6px 20px rgba(28, 25, 23, 0.08)',
        lg: '0 12px 40px rgba(28, 25, 23, 0.1)',
        xl: '0 24px 60px rgba(28, 25, 23, 0.14)',
        // Elegant glow
        glow: '0 0 40px rgba(27, 67, 50, 0.15)',
        'glow-accent': '0 0 40px rgba(184, 134, 11, 0.2)',
      },

      backgroundImage: {
        // Subtle grain texture
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        // Elegant gradients
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-editorial': 'linear-gradient(145deg, var(--tw-gradient-stops))',
      },

      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-down': 'fadeDown 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      transitionDuration: {
        DEFAULT: '300ms',
        fast: '150ms',
        slow: '500ms',
      },

      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
