import { createBdd, test as base } from 'playwright-bdd';

import { CommonUIPage } from './pages/common-ui.page';
import { JobTitlesPage } from './pages/admin/job-titles.page';
import { LoginPage } from './pages/login.page';
import { UserManagementPage } from './pages/admin/user-management.page';
import type { ScenarioData } from './world/scenario-data';

/**
 * Dependency injection and per-scenario state - the playwright-bdd replacement for CustomWorld.
 *
 * Each page-object fixture is built from Playwright's own per-test `page` fixture, so isolation
 * (cookies, storage, page) is handled by the runner rather than a hand-written Before hook.
 * The `data` fixture is a fresh object per test, giving the same per-scenario lifetime the
 * World's `data` field had - nothing leaks between scenarios or across workers.
 */
type Fixtures = {
  loginPage: LoginPage;
  commonUI: CommonUIPage;
  userManagement: UserManagementPage;
  jobTitles: JobTitlesPage;
  data: ScenarioData;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  commonUI: async ({ page }, use) => {
    await use(new CommonUIPage(page));
  },
  userManagement: async ({ page }, use) => {
    await use(new UserManagementPage(page));
  },
  jobTitles: async ({ page }, use) => {
    await use(new JobTitlesPage(page));
  },
  data: async ({}, use) => {
    await use({} as ScenarioData);
  },
});

export const { Given, When, Then, Before, After } = createBdd(test);
