import type { Config } from 'tailwindcss';
import sharedConfig from '@clubvantage/config/tailwind';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [sharedConfig],
  theme: {
    extend: {
      // Portal-specific extensions
    },
  },
};

export default config;
