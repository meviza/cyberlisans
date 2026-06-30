import cyberlisansPreset from '../../packages/config/tailwind-preset.cjs';

const config = {
  presets: [cyberlisansPreset],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
};

export default config;
