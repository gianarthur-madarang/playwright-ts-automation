import { test as setup } from '@playwright/test';

import { ADMIN_AUTH_FILE } from '../config/auth';
import { LoginPage } from '../pages/login.page';

/**
 * Runs once (as the "setup" Playwright project, a dependency of "admin") to authenticate as
 * Admin and cache the session, so every admin-tagged scenario can skip a full form submission.
 * Not a BDD step - a plain @playwright/test test, since this has nothing to do with a scenario.
 */
setup('authenticate as Admin', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginAs('Admin');
  await loginPage.isDashboardDisplayed();
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
