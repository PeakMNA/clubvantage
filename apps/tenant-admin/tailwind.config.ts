import type { Config } from 'tailwindcss';
import { platformPreset } from '@clubvantage/config/tailwind/platform';

const config: Config = {
  darkMode: 'class',
  presets: [platformPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Tenant Admin specific overrides
      // Colors can be overridden via CSS variables for tenant branding
    },
  },
  plugins: [],
};

export default config;
