import type { Page } from 'playwright';

import { getUser } from '../config/users';
import { loginUrl } from '../config/env';
import { BasePage } from './base.page';

/** OrangeHRM login screen. Selectors verified against OrangeHRM OS 5.9. */
export class LoginPage extends BasePage {
  private readonly USERNAME = 'input[name="username"]';
  private readonly PASSWORD = 'input[name="password"]';
  private readonly SUBMIT = 'button[type="submit"]';
  private readonly ERROR_ALERT = '.oxd-alert--error';
  private readonly FIELD_ERROR = '.oxd-input-field-error-message';
  private readonly DASHBOARD_HEADER = '.oxd-topbar-header-breadcrumb-module';
  private readonly USER_DROPDOWN = '.oxd-userdropdown-name';

  constructor(page: Page) {
    super(page);
  }

  async goToLoginPage(): Promise<void> {
    await this.ui.goToUrl(loginUrl());
    await this.waitForVisible(this.USERNAME);
  }

  /** Submits the credentials for a role. Does not assert the outcome - that is the step's job. */
  async login(role: string): Promise<void> {
    const user = getUser(role);
    await this.ui.clearAndFill(this.USERNAME, user.username);
    await this.ui.clearAndFill(this.PASSWORD, user.password);
    await this.ui.click(this.SUBMIT);
  }

  async loginAs(role: string): Promise<void> {
    await this.goToLoginPage();
    await this.login(role);
  }

  // ---- Verifications ----

  async isDashboardDisplayed(): Promise<boolean> {
    return this.waitForVisible(this.DASHBOARD_HEADER);
  }

  async getLoggedInUserName(): Promise<string> {
    return this.getText(this.USER_DROPDOWN);
  }

  /** The "Invalid credentials" banner shown for a wrong username or password. */
  async isInvalidCredentialsErrorDisplayed(): Promise<boolean> {
    return this.waitForVisible(this.ERROR_ALERT);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.ERROR_ALERT);
  }

  /** The per-field "Required" messages shown when the form is submitted empty. */
  async getFieldErrors(): Promise<string[]> {
    return this.ui.getTextList(this.FIELD_ERROR);
  }

  async isStillOnLoginPage(): Promise<boolean> {
    return this.ui.isVisible(this.USERNAME);
  }
}
