import type { Config } from 'tailwindcss';
import platformPreset from '@clubvantage/config/tailwind/platform';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [platformPreset],
  theme: {
    extend: {
      // App-specific extensions if needed
    },
  },
};

export default config;
