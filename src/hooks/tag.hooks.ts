import { Before } from '../fixtures';

/**
 * Tag-scoped setup, the analogue of cpm-automation's @postConsentFormBefore style hooks.
 *
 * playwright-bdd's Before receives the same fixtures a step does. Keep these for setup a
 * scenario needs but should not spend Gherkin lines on.
 */

/** Logs in as Admin before any scenario tagged @loginAsAdmin. */
Before({ tags: '@loginAsAdmin' }, async ({ loginPage, data }) => {
  await loginPage.loginAs('Admin');
  await loginPage.isDashboardDisplayed();
  data.loggedInRole = 'Admin';
});
