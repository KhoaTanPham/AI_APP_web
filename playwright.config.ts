import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './working-artifacts/e2e',
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/node_modules/**', '**/dist/**'],
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm start --workspace=mobilemarket-server',
      url: 'http://127.0.0.1:3000/api/products',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm run dev --workspace=client -- --host 127.0.0.1 --port 5174',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})