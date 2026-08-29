import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

import { env, isHeadless } from './src/config/env';

/**
 * Run configuration. Replaces both cucumber.js (profiles -> `bddgen test --tags` in the npm
 * scripts) and browser.hooks.ts (browser lifecycle, tracing and screenshots are now runner
 * concerns declared in `use` below).
 *
 * `bddgen test` compiles features/*.feature into Playwright test files under `testDir`;
 * `playwright test` then runs them. Tag filtering happens at generation time via
 * `bddgen test --tags "<cucumber tag expression>"`.
 */
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['src/fixtures.ts', 'src/steps/**/*.ts', 'src/hooks/**/*.ts'],
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  workers: 2, // was cucumber `parallel: 2`
  forbidOnly: !!process.env.CI,
  timeout: 60_000, // was setDefaultTimeout(60_000)
  expect: { timeout: env.expectTimeout },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    headless: isHeadless,
    viewport: { width: 1512, height: 900 },
    ignoreHTTPSErrors: true,
    actionTimeout: env.actionTimeout,
    navigationTimeout: env.navigationTimeout,
    trace: 'retain-on-failure', // replaces manual context.tracing start/stop
    screenshot: 'only-on-failure', // replaces manual screenshot + attach
  },
  projects: [{ name: 'chromium' }],
});
