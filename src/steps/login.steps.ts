import { expect } from '../utils/expect';

import { Given, Then, When } from '../fixtures';

// Steps are thin wrappers: one page-object call, then an assertion. No selectors here.

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.goToLoginPage();
});

Given('I logged in as {string}', async ({ loginPage, data }, role: string) => {
  await loginPage.loginAs(role);
  data.loggedInRole = role;
  expect(await loginPage.isDashboardDisplayed(), `login as "${role}" did not reach the dashboard`).toBe(
    true,
  );
});

When('I log in as {string}', async ({ loginPage, data }, role: string) => {
  await loginPage.loginAs(role);
  data.loggedInRole = role;
});

When('I submit the login form with empty credentials', async ({ loginPage }) => {
  await loginPage.loginAs('Empty Credentials');
});

Then('the dashboard should be displayed', async ({ loginPage }) => {
  expect(await loginPage.isDashboardDisplayed()).toBe(true);
});

Then('the logged in user name should be displayed', async ({ loginPage }) => {
  const name = await loginPage.getLoggedInUserName();
  expect(name.length).toBeGreaterThan(0);
});

Then('the invalid credentials error should be displayed', async ({ loginPage }) => {
  expect(await loginPage.isInvalidCredentialsErrorDisplayed()).toBe(true);
  expect(await loginPage.getErrorMessage()).toContain('Invalid credentials');
});

Then('required field errors should be displayed', async ({ loginPage }) => {
  const errors = await loginPage.getFieldErrors();
  expect(errors.length).toBeGreaterThanOrEqual(1);
  expect(errors.join(' ')).toContain('Required');
});

Then('I should remain on the login page', async ({ loginPage }) => {
  expect(await loginPage.isStillOnLoginPage()).toBe(true);
});
