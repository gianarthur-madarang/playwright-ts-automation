import type { Page } from 'playwright';

import { BasePage } from '../base.page';

/**
 * Admin > User Management. Only what is unique to this screen - the table, record count,
 * row actions and dialog all live in CommonUIPage.
 *
 * Verified: 4 filters (Username, User Role, Employee Name, Status);
 * columns Username / User Role / Employee Name / Status / Actions.
 */
export class UserManagementPage extends BasePage {
  private readonly USERNAME_INPUT = '.oxd-form .oxd-input-group:has(label:text-is("Username")) input';
  private readonly EMPLOYEE_NAME_INPUT =
    '.oxd-form .oxd-input-group:has(label:text-is("Employee Name")) input';
  private readonly PASSWORD_INPUT = 'input[type="password"]';
  private readonly SELECT_WRAPPER = '.oxd-select-text';
  private readonly SELECT_OPTION = '.oxd-select-option';
  private readonly AUTOCOMPLETE_OPTION = '.oxd-autocomplete-option';

  constructor(page: Page) {
    super(page);
  }

  static readonly EXPECTED_COLUMNS = ['Username', 'User Role', 'Employee Name', 'Status', 'Actions'];
  static readonly EXPECTED_FILTERS = ['Username', 'User Role', 'Employee Name', 'Status'];

  // ---- Search filters ----

  async searchByUsername(username: string): Promise<void> {
    await this.ui.clearAndFill(this.USERNAME_INPUT, username);
  }

  // ---- Add / Edit user form ----

  /** Selects a value in the form dropdown at the given 1-based position. */
  async selectDropdown(position: number, option: string): Promise<void> {
    await this.ui.el(this.SELECT_WRAPPER).nth(position - 1).click();
    await this.ui.click(`${this.SELECT_OPTION}:has-text("${option}")`);
  }

  async selectUserRole(role: string): Promise<void> {
    await this.selectDropdown(1, role);
  }

  async selectStatus(status: string): Promise<void> {
    await this.selectDropdown(2, status);
  }

  /**
   * Types into the Employee Name autocomplete and picks the first real suggestion.
   *
   * The dropdown renders a "Searching..." placeholder that is itself an .oxd-autocomplete-option,
   * so waiting on the option selector alone returns instantly and clicking it selects no employee -
   * the form then fails validation on save with no toast. Filter the placeholder out.
   */
  async setEmployeeName(partialName: string): Promise<void> {
    await this.ui.clearAndType(this.EMPLOYEE_NAME_INPUT, partialName);

    const suggestion = this.page
      .locator(this.AUTOCOMPLETE_OPTION)
      .filter({ hasNotText: 'Searching' })
      .first();
    await suggestion.waitFor({ state: 'visible' });
    await suggestion.click();
  }

  async setUsername(username: string): Promise<void> {
    await this.ui.clearAndFill(this.USERNAME_INPUT, username);
  }

  async setPasswords(password: string): Promise<void> {
    const fields = this.ui.el(this.PASSWORD_INPUT);
    await fields.nth(0).fill(password);
    await fields.nth(1).fill(password);
  }

  async isUserFormDisplayed(): Promise<boolean> {
    return this.waitForVisible(this.USERNAME_INPUT);
  }
}
