import { defineConfig } from '@trigger.dev/sdk/v3';

export default defineConfig({
  project: 'proj_sibrytqjplnlnkvxwfve',
  runtime: 'node',
  logLevel: 'info',
  maxDuration: 60,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10_000,
      factor: 2,
    },
  },
  dirs: ['./src/trigger'],
  build: {
    external: [],
  },
  globals: {
    API_URL: process.env.API_URL,
    INTERNAL_SERVICE_SECRET: process.env.INTERNAL_SERVICE_SECRET,
  },
});
