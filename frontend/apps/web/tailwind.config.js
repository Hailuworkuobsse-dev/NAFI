import preset from '../../packages/config/tailwind.preset.js';

export default {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui-react/src/**/*.{ts,tsx}',
  ],
};
