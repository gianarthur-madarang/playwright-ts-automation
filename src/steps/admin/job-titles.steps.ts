import { expect } from '../../utils/expect';

import { JobTitlesPage } from '../../pages/admin/job-titles.page';
import { uniqueName } from '../../utils/helper.utils';
import { Then, When } from '../../fixtures';

When('I fill the job title form with a unique title', async ({ jobTitles, data }) => {
  const title = uniqueName('jobtitle');
  data.jobTitle = title;
  data.jobDescription = 'Created by playwright-ts-automation';

  await jobTitles.setJobTitle(title);
  await jobTitles.setDescription(data.jobDescription);
});

Then('the job title form should be displayed', async ({ jobTitles }) => {
  expect(await jobTitles.isJobTitleFormDisplayed()).toBe(true);
});

Then('the Job Titles columns should be displayed', async ({ commonUI }) => {
  expect(await commonUI.areColumnsDisplayed(JobTitlesPage.EXPECTED_COLUMNS)).toBe(true);
});

Then('the select all checkbox should be displayed', async ({ jobTitles }) => {
  expect(await jobTitles.isSelectAllDisplayed()).toBe(true);
});

Then('the created job title should be listed', async ({ commonUI, data }) => {
  const title = data.jobTitle;
  expect(title, 'no job title was generated earlier in this scenario').toBeDefined();
  await expect
    .poll(async () => commonUI.isRowPresent(title as string), { timeout: 20_000 })
    .toBe(true);
});

When('I delete the created job title', async ({ commonUI, data }) => {
  const title = data.jobTitle;
  expect(title, 'no job title was generated earlier in this scenario').toBeDefined();
  await commonUI.clickRowActionFor(title as string, 'delete');
  await commonUI.confirmDialog();
});

Then('the created job title should no longer be listed', async ({ commonUI, data }) => {
  const title = data.jobTitle;
  await expect
    .poll(async () => commonUI.isRowPresent(title as string), { timeout: 20_000 })
    .toBe(false);
});
