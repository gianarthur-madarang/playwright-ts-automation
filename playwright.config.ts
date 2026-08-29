import { defineConfig, devices } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

import { ADMIN_AUTH_FILE } from './src/config/auth';
import { env, isHeadless } from './src/config/env';

/**
 * Run configuration. Replaces both cucumber.js (profiles -> `bddgen test --tags` in the npm
 * scripts) and browser.hooks.ts (browser lifecycle, tracing and screenshots are now runner
 * concerns declared in `use` below).
 *
 * `bddgen test` compiles features/*.feature into Playwright test files under each project's
 * testDir; `playwright test` then runs them. Tag filtering happens at generation time via
 * `bddgen test --tags "<cucumber tag expression>"`, applied uniformly across both projects below.
 *
 * Split into two BDD projects (playwright-bdd's `defineBddProject`, the documented pattern for a
 * suite that mixes authenticated and unauthenticated scenarios) so only the admin scenarios get
 * the cached-session `storageState` - Login.feature's own login-form scenarios must still hit a
 * real, unauthenticated login page.
 */
const adminBdd = defineBddProject({
  name: 'admin',
  features: 'features/admin/**/*.feature',
  steps: ['src/fixtures.ts', 'src/steps/**/*.ts', 'src/hooks/**/*.ts'],
});

const loginBdd = defineBddProject({
  name: 'login',
  features: 'features/Login.feature',
  steps: ['src/fixtures.ts', 'src/steps/**/*.ts', 'src/hooks/**/*.ts'],
});

const baseUse = {
  ...devices['Desktop Chrome'],
  headless: isHeadless,
  viewport: { width: 1512, height: 900 },
  ignoreHTTPSErrors: true,
  actionTimeout: env.actionTimeout,
  navigationTimeout: env.navigationTimeout,
  trace: 'retain-on-failure', // replaces manual context.tracing start/stop
  screenshot: 'only-on-failure', // replaces manual screenshot + attach
} as const;

export default defineConfig({
  // Was cucumber `parallel: 2`. Safe only because every scenario either reads shared data
  // read-only or mutates a uniquely-named record (see uniqueName() and CLAUDE.md rule 3) -
  // no scenario may assert an exact snapshot count or mutate a shared/non-unique row, or two
  // workers racing against the live OrangeHRM demo could interfere with each other.
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000, // was setDefaultTimeout(60_000)
  expect: { timeout: env.expectTimeout },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: baseUse,
  projects: [
    { name: 'setup', testDir: './src/setup', testMatch: /.*\.setup\.ts/ },
    { ...adminBdd, dependencies: ['setup'], use: { ...baseUse, storageState: ADMIN_AUTH_FILE } },
    { ...loginBdd, use: baseUse },
  ],
});
