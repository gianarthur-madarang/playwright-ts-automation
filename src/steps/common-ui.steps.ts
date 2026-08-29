import type { DataTable } from 'playwright-bdd';

import { expect } from '../utils/expect';

import { Then, When } from '../fixtures';

// Shared across every Admin page. Adding a page means adding a route to CommonUIPage,
// not adding steps here.

When('I open the {string} page', async ({ commonUI }, pageName: string) => {
  await commonUI.navigateToPage(pageName);
});

When('I click the Add button', async ({ commonUI }) => {
  await commonUI.clickAddButton();
});

When('I click the {string} button', async ({ commonUI }, label: string) => {
  await commonUI.clickButton(label);
});

When('I click Search', async ({ commonUI }) => {
  await commonUI.clickSearch();
});

When('I click Reset', async ({ commonUI }) => {
  await commonUI.clickReset();
});

When(
  'I click the {string} action on the row for {string}',
  async ({ commonUI }, action: string, value: string) => {
    await commonUI.clickRowActionFor(value, action as 'edit' | 'delete');
  },
);

When('I confirm the delete dialog', async ({ commonUI }) => {
  await commonUI.confirmDialog();
});

When('I cancel the delete dialog', async ({ commonUI }) => {
  await commonUI.cancelDialog();
});

When('I remember the current record count', async ({ commonUI, data }) => {
  data.recordCountBefore = await commonUI.getRecordCount();
});

// ---- Assertions ----

Then('the {string} main page should be displayed', async ({ commonUI }, name: string) => {
  expect(await commonUI.isMainPageDisplayed(name)).toBe(true);
});

Then('the page table should be displayed', async ({ commonUI }) => {
  await expect(commonUI.table).toBeVisible();
});

Then(
  'the following columns should be displayed in the page table',
  async ({ commonUI }, table: DataTable) => {
    const expected = table.raw().map(([column]) => column ?? '');
    const actual = await commonUI.getColumnHeaders();
    for (const column of expected) {
      expect(actual.join(' | ')).toContain(column);
    }
  },
);

Then('the Add button should be displayed', async ({ commonUI }) => {
  expect(await commonUI.isAddButtonDisplayed()).toBe(true);
});

Then('the record count should be displayed', async ({ commonUI }) => {
  expect(await commonUI.isRecordCountDisplayed()).toBe(true);
});

/**
 * Deliberately not "count === rows": OrangeHRM pages at 50 rows, and the shared demo's
 * user count crossed that threshold mid-development (34 -> 52). Assert the invariant that
 * holds at any dataset size instead.
 */
Then('the rows shown should be consistent with the record count', async ({ commonUI }) => {
  const total = await commonUI.getRecordCount();
  const shown = await commonUI.getRowCount();

  expect(total, 'record count should be positive').toBeGreaterThan(0);
  expect(shown, 'at least one row should be rendered').toBeGreaterThan(0);
  expect(shown, 'a page cannot show more rows than exist').toBeLessThanOrEqual(total);
});

Then('the record count should have increased by {int}', async ({ commonUI, data }, delta: number) => {
  const before = data.recordCountBefore;
  expect(before, 'no record count was captured earlier in this scenario').toBeDefined();
  await expect
    .poll(async () => commonUI.getRecordCount(), { timeout: 15_000 })
    .toBe((before as number) + delta);
});

Then('the following filters should be displayed', async ({ commonUI }, table: DataTable) => {
  const expected = table.raw().map(([label]) => label ?? '');
  const actual = await commonUI.getFilterLabels();
  for (const label of expected) {
    expect(actual).toContain(label);
  }
});

Then('a success toast should be displayed', async ({ commonUI, data }) => {
  await expect(commonUI.toast).toBeVisible();
  data.toastMessage = await commonUI.getToastMessage();
});

Then('the confirm dialog should be displayed', async ({ commonUI }) => {
  await expect(commonUI.dialog).toBeVisible();
});

Then('the row for {string} should be displayed', async ({ commonUI }, value: string) => {
  await expect
    .poll(async () => commonUI.isRowPresent(value), { timeout: 15_000 })
    .toBe(true);
});

Then('the row for {string} should not be displayed', async ({ commonUI }, value: string) => {
  await expect
    .poll(async () => commonUI.isRowPresent(value), { timeout: 15_000 })
    .toBe(false);
});
