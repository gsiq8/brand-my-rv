import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:3000', browserName: 'chromium' },
  // production build, not dev/HMR
  webServer: { command: 'npm run build && npm start', url: 'http://localhost:3000', timeout: 180_000, reuseExistingServer: true },
});