import type { Locator, Page } from 'playwright';

import { BasePage } from './base.page';

/**
 * Furniture shared by every OrangeHRM Admin page: breadcrumb, record count, data table,
 * row actions, Add button, confirm dialog, toast, filter panel.
 *
 * Counterpart of cpm-automation's CommonUIPage. Written once; JobTitlesPage exists mainly
 * to prove this generalises rather than being User-Management-specific in disguise.
 *
 * Selectors verified against OrangeHRM OS 5.9.
 */
export class CommonUIPage extends BasePage {
  // ---- Shared selectors ----
  private readonly BREADCRUMB = '.oxd-topbar-header-breadcrumb';
  private readonly BREADCRUMB_MODULE = '.oxd-topbar-header-breadcrumb-module';
  private readonly TABLE = '.oxd-table';
  private readonly TABLE_HEADER_CELL = '.oxd-table-header .oxd-table-th';
  private readonly ROW = '.oxd-table-card';
  private readonly ROW_CELL = '.oxd-table-cell';
  private readonly ROW_ACTION = '.oxd-table-cell-actions button';
  private readonly ADD_BUTTON = 'button:has-text("Add")';
  private readonly LOADER = '.oxd-loading-spinner';
  private readonly DIALOG = '.orangehrm-dialog-popup';
  private readonly DIALOG_CONFIRM = 'button:has-text("Yes, Delete")';
  private readonly DIALOG_CANCEL = 'button:has-text("No, Cancel")';
  private readonly TOAST = '.oxd-toast';
  private readonly FILTER_GROUP = '.oxd-form .oxd-input-group';
  private readonly SEARCH_BUTTON = 'button[type="submit"]:has-text("Search")';
  private readonly RESET_BUTTON = 'button:has-text("Reset")';
  private readonly PAGINATION_PAGE = '.oxd-pagination-page-item--page';

  /** Routes for the Admin pages under test. */
  private static readonly ROUTES: Record<string, string> = {
    'user management': '/admin/viewSystemUsers',
    'system users': '/admin/viewSystemUsers',
    'job titles': '/admin/viewJobTitleList',
    'pay grades': '/admin/viewPayGrades',
    'employment status': '/admin/employmentStatus',
    'job categories': '/admin/jobCategory',
    'work shifts': '/admin/workShift',
    nationalities: '/admin/nationality',
    organization: '/admin/viewOrganizationGeneralInformation',
    locations: '/admin/viewLocations',
  };

  constructor(page: Page) {
    super(page);
  }

  // ---- Locators exposed for step-level assertions ----

  get toast(): Locator {
    return this.ui.el(this.TOAST).first();
  }

  get breadcrumb(): Locator {
    return this.ui.el(this.BREADCRUMB).first();
  }

  get table(): Locator {
    return this.ui.el(this.TABLE).first();
  }

  get rows(): Locator {
    return this.ui.el(this.ROW);
  }

  get dialog(): Locator {
    return this.ui.el(this.DIALOG).first();
  }

  // ---- Navigation ----

  async navigateToPage(pageName: string): Promise<void> {
    const path = CommonUIPage.ROUTES[pageName.trim().toLowerCase()];
    if (!path) {
      throw new Error(
        `Unknown page "${pageName}". Known: ${Object.keys(CommonUIPage.ROUTES).join(', ')}`,
      );
    }
    await this.goTo(path);
    await this.waitForPageReady();
  }

  /**
   * Waits for a navigated page to actually be rendered.
   *
   * The loader alone is not a sufficient gate: waitFor({state:'hidden'}) resolves immediately
   * when the element never existed, so reads could hit an unrendered table.
   */
  async waitForPageReady(): Promise<void> {
    await this.waitForVisible(this.BREADCRUMB);
    await this.waitForLoaderToDisappear();
  }

  /** Whether the breadcrumb names the given page, e.g. "User Management". */
  async isMainPageDisplayed(pageName: string): Promise<boolean> {
    const text = await this.getText(this.BREADCRUMB);
    return text.toLowerCase().includes(pageName.trim().toLowerCase());
  }

  async getModuleName(): Promise<string> {
    return this.getText(this.BREADCRUMB_MODULE);
  }

  // ---- Table ----

  async isTableDisplayed(): Promise<boolean> {
    return this.waitForVisible(this.TABLE);
  }

  /** Header labels. Waits for the header to render before reading, so a slow load
   *  surfaces as a timeout rather than an empty array. */
  async getColumnHeaders(): Promise<string[]> {
    await this.waitForVisible(this.TABLE_HEADER_CELL);
    const headers = await this.ui.getTextList(this.TABLE_HEADER_CELL);
    return headers
      .map((header) => header.replace(/AscendingDescending/g, '').trim())
      .filter((header) => header.length > 0);
  }

  async areColumnsDisplayed(expected: string[]): Promise<boolean> {
    const actual = await this.getColumnHeaders();
    return expected.every((column) => actual.some((header) => header.includes(column)));
  }

  async getRowCount(): Promise<number> {
    return this.ui.count(this.ROW);
  }

  /** Cell texts of a 1-based row. */
  async getRowValues(rowNumber: number): Promise<string[]> {
    const cells = this.rows.nth(rowNumber - 1).locator(this.ROW_CELL);
    const texts = await cells.allInnerTexts();
    return texts.map((text) => text.trim());
  }

  /** Whether any row contains the given text. */
  async isRowPresent(value: string): Promise<boolean> {
    return (await this.rows.filter({ hasText: value }).count()) > 0;
  }

  /**
   * Clicks a row action. OrangeHRM renders inline icon buttons - delete is bi-trash,
   * edit is bi-pencil-fill - rather than an overflow menu.
   */
  async clickRowAction(action: 'edit' | 'delete', rowNumber: number): Promise<void> {
    const icon = action === 'edit' ? '.bi-pencil-fill' : '.bi-trash';
    const row = this.rows.nth(rowNumber - 1);
    await row.locator(`${this.ROW_ACTION}:has(${icon})`).first().click();
  }

  /** Clicks a row action on the row containing the given text, rather than by position. */
  async clickRowActionFor(value: string, action: 'edit' | 'delete'): Promise<void> {
    const icon = action === 'edit' ? '.bi-pencil-fill' : '.bi-trash';
    const row = this.rows.filter({ hasText: value }).first();
    await row.locator(`${this.ROW_ACTION}:has(${icon})`).first().click();
  }

  // ---- Record count / pagination ----

  /**
   * The "(34) Records Found" count. Used instead of pagination assertions because no
   * Admin page exceeds the 50-row page size, so no Admin page paginates.
   */
  async getRecordCount(): Promise<number> {
    const text = await this.getText('.oxd-text:has-text("Records Found")');
    const match = /\((\d+)\)/.exec(text);
    if (!match?.[1]) throw new Error(`Could not parse a record count from "${text}"`);
    return Number(match[1]);
  }

  async isRecordCountDisplayed(): Promise<boolean> {
    return this.waitForVisible('.oxd-text:has-text("Records Found")');
  }

  async isPaginationDisplayed(): Promise<boolean> {
    return (await this.ui.count(this.PAGINATION_PAGE)) > 0;
  }

  // ---- Buttons ----

  async clickAddButton(): Promise<void> {
    await this.ui.click(this.ADD_BUTTON);
  }

  async isAddButtonDisplayed(): Promise<boolean> {
    return this.waitForVisible(this.ADD_BUTTON);
  }

  async clickSearch(): Promise<void> {
    await this.ui.click(this.SEARCH_BUTTON);
    await this.waitForLoaderToDisappear();
  }

  async clickReset(): Promise<void> {
    await this.ui.click(this.RESET_BUTTON);
    await this.waitForLoaderToDisappear();
  }

  /** Clicks a footer/form button by its visible label, e.g. "Save", "Cancel". */
  async clickButton(label: string): Promise<void> {
    await this.ui.click(`button:has-text("${label}") >> visible=true`);
  }

  // ---- Filters ----

  async getFilterLabels(): Promise<string[]> {
    await this.waitForVisible(this.FILTER_GROUP);
    const labels = await this.ui.getTextList(`${this.FILTER_GROUP} label`);
    return labels.filter((label) => label.length > 0);
  }

  /** Fills a text filter identified by its label. */
  async fillFilter(label: string, value: string): Promise<void> {
    const group = this.ui
      .el(this.FILTER_GROUP)
      .filter({ has: this.page.locator(`label:text-is("${label}")`) })
      .first();
    await group.locator('input').first().fill(value);
  }

  /** Selects a value in a dropdown filter identified by its label. */
  async selectFilter(label: string, option: string): Promise<void> {
    const group = this.ui
      .el(this.FILTER_GROUP)
      .filter({ has: this.page.locator(`label:text-is("${label}")`) })
      .first();
    await group.locator('.oxd-select-text').first().click();
    await this.ui.click(`.oxd-select-option:has-text("${option}")`);
  }

  // ---- Dialog ----

  async isConfirmDialogDisplayed(): Promise<boolean> {
    return this.waitForVisible(this.DIALOG);
  }

  async confirmDialog(): Promise<void> {
    await this.dialog.locator(this.DIALOG_CONFIRM).click();
    await this.waitForLoaderToDisappear();
  }

  async cancelDialog(): Promise<void> {
    await this.dialog.locator(this.DIALOG_CANCEL).click();
  }

  // ---- Toast ----

  async getToastMessage(): Promise<string> {
    return this.getText(this.TOAST);
  }

  async isToastDisplayed(): Promise<boolean> {
    return this.waitForVisible(this.TOAST);
  }

  // ---- Loading ----

  async waitForLoaderToDisappear(): Promise<void> {
    await this.waitForHidden(this.LOADER, 20_000);
  }
}
