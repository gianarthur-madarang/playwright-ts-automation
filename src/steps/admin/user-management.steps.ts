import { expect } from '../../utils/expect';

import { UserManagementPage } from '../../pages/admin/user-management.page';
import { uniqueName } from '../../utils/helper.utils';
import { Then, When } from '../../fixtures';

When('I search for the username {string}', async ({ userManagement, commonUI }, username: string) => {
  await userManagement.searchByUsername(username);
  await commonUI.clickSearch();
});

When('I fill the user form with a unique username', async ({ userManagement, data }) => {
  const username = uniqueName('user');
  data.username = username;

  await userManagement.selectUserRole('ESS');
  await userManagement.setEmployeeName('a');
  await userManagement.selectStatus('Enabled');
  await userManagement.setUsername(username);
  await userManagement.setPasswords('Passw0rd!2026');
});

Then('the user form should be displayed', async ({ userManagement }) => {
  expect(await userManagement.isUserFormDisplayed()).toBe(true);
});

Then('the User Management columns should be displayed', async ({ commonUI }) => {
  expect(await commonUI.areColumnsDisplayed(UserManagementPage.EXPECTED_COLUMNS)).toBe(true);
});

Then('the User Management filters should be displayed', async ({ commonUI }) => {
  const actual = await commonUI.getFilterLabels();
  for (const label of UserManagementPage.EXPECTED_FILTERS) {
    expect(actual).toContain(label);
  }
});

Then('the created user should be listed', async ({ commonUI, data }) => {
  const username = data.username;
  expect(username, 'no username was generated earlier in this scenario').toBeDefined();
  await expect
    .poll(async () => commonUI.isRowPresent(username as string), { timeout: 20_000 })
    .toBe(true);
});
