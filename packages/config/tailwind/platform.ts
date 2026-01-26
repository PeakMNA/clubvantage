import type { Config } from 'tailwindcss';

/**
 * Platform Manager Design System
 * ================================
 * A professional, clean admin interface using Blue/Slate palette
 *
 * Primary: Blue 800 (#1E40AF) - Actions, links, focus states
 * Secondary: Slate 500 (#64748B) - Secondary text, borders
 * Background: Slate 50 (#F8FAFC) - Page background
 * Surface: White - Cards, modals
 *
 * Status Colors:
 * - Active/Success: Emerald 500
 * - Warning/Pending: Amber 500
 * - Error/Suspended: Red 500
 * - Neutral/Archived: Stone 500
 * - Info/Converted: Blue 500
 *
 * Health Score:
 * - Healthy (80-100): Emerald
 * - Warning (60-79): Amber
 * - Critical (0-59): Red
 */

export const platformPreset: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        // Primary: Deep Blue for actions and focus
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },

        // Secondary: Slate for neutral elements
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },

        // Accent
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        // Slate for neutral tones
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
          950: '#020617',
        },

        // Status colors
        success: {
          DEFAULT: '#10B981',
          foreground: '#FFFFFF',
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#78350F',
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        info: {
          DEFAULT: '#3B82F6',
          foreground: '#FFFFFF',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
        },

        // Health score colors
        health: {
          healthy: '#10B981',
          warning: '#F59E0B',
          critical: '#EF4444',
        },

        // Tenant status colors
        status: {
          active: '#10B981',
          pending: '#F59E0B',
          suspended: '#EF4444',
          archived: '#78716C',
          converted: '#3B82F6',
        },

        // Background & Surface
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
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },

      fontSize: {
        // Custom typography scale
        'display': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],   // 36px
        'h1': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }],      // 30px
        'h2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],           // 24px
        'h3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],       // 20px
        'h4': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],           // 16px
        'body': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],    // 14px
        'small': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],       // 12px
        'caption': ['0.6875rem', { lineHeight: '0.875rem', fontWeight: '500' }], // 11px
      },

      spacing: {
        // Custom spacing scale (base: 4px)
        'xs': '0.25rem',   // 4px
        'sm': '0.5rem',    // 8px
        'md': '1rem',      // 16px
        'lg': '1.5rem',    // 24px
        'xl': '2rem',      // 32px
        '2xl': '3rem',     // 48px
        '3xl': '4rem',     // 64px
      },

      borderRadius: {
        'none': '0',
        'sm': '0.25rem',   // 4px - buttons, inputs, badges
        'md': '0.5rem',    // 8px - cards, modals
        'lg': '0.75rem',   // 12px - large cards, panels
        'xl': '1rem',      // 16px
        '2xl': '1.5rem',   // 24px
        'full': '9999px',  // pills, avatars
      },

      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.15)',
        // Blue glow for primary actions
        'primary-sm': '0 1px 3px 0 rgba(30, 64, 175, 0.1)',
        'primary-md': '0 4px 6px -1px rgba(30, 64, 175, 0.15)',
        'primary-lg': '0 10px 15px -3px rgba(30, 64, 175, 0.2)',
        // Success glow
        'success-sm': '0 1px 3px 0 rgba(16, 185, 129, 0.1)',
        'success-md': '0 4px 6px -1px rgba(16, 185, 129, 0.15)',
        // Warning glow
        'warning-sm': '0 1px 3px 0 rgba(245, 158, 11, 0.1)',
        'warning-md': '0 4px 6px -1px rgba(245, 158, 11, 0.15)',
        // Error glow
        'error-sm': '0 1px 3px 0 rgba(239, 68, 68, 0.1)',
        'error-md': '0 4px 6px -1px rgba(239, 68, 68, 0.15)',
        // Inner shadow
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
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
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-to-right': {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(100%)', opacity: '0' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(30, 64, 175, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(30, 64, 175, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(30, 64, 175, 0)' },
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
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
        'slide-out-to-right': 'slide-out-to-right 0.3s ease-in',
        'slide-in-from-top': 'slide-in-from-top 0.2s ease-out',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
};

export default platformPreset;
