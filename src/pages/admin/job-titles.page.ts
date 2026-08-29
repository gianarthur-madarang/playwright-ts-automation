import type { Page } from 'playwright';

import { BasePage } from '../base.page';

/**
 * Admin > Job > Job Titles.
 *
 * Intentionally thin. Everything this screen needs - table, record count, row actions,
 * confirm dialog, toast - is inherited behaviour from CommonUIPage. That is the point of
 * covering a second page in the POC.
 *
 * Verified: no filter panel, a select-all checkbox, columns Job Titles / Job Description / Actions.
 */
export class JobTitlesPage extends BasePage {
  private readonly TITLE_INPUT = '.oxd-form .oxd-input-group:has(label:text-is("Job Title")) input';
  private readonly DESCRIPTION_TEXTAREA = '.oxd-form textarea';
  private readonly SELECT_ALL = '.oxd-table-header input[type="checkbox"]';

  constructor(page: Page) {
    super(page);
  }

  static readonly EXPECTED_COLUMNS = ['Job Titles', 'Job Description', 'Actions'];

  async setJobTitle(title: string): Promise<void> {
    await this.ui.clearAndFill(this.TITLE_INPUT, title);
  }

  async setDescription(description: string): Promise<void> {
    await this.ui.clearAndFill(this.DESCRIPTION_TEXTAREA, description);
  }

  async isJobTitleFormDisplayed(): Promise<boolean> {
    return this.waitForVisible(this.TITLE_INPUT);
  }

  async isSelectAllDisplayed(): Promise<boolean> {
    return this.waitForVisible(this.SELECT_ALL);
  }
}
