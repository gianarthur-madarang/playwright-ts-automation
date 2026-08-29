import type { Page } from 'playwright';

import { appUrl } from '../config/env';
import { UiUtils } from '../utils/ui.utils';

/**
 * Base for every page object. Counterpart of cpm-automation's BasePagePw.
 *
 * Deliberately omits a hardWait()/waitForPageToLoad() sleep. BasePagePw's version is a bare
 * 3s sleep; here waits are conditions on the thing being waited for.
 */
export abstract class BasePage {
  protected readonly ui: UiUtils;

  constructor(protected readonly page: Page) {
    this.ui = new UiUtils(page);
  }

  /** Navigates to an in-app route, e.g. goTo('/admin/viewSystemUsers'). */
  protected async goTo(path: string): Promise<void> {
    await this.ui.goToUrl(appUrl(path));
  }

  protected waitForVisible(selector: string, timeout?: number): Promise<boolean> {
    return this.ui.waitForState(selector, 'visible', timeout);
  }

  protected waitForHidden(selector: string, timeout?: number): Promise<boolean> {
    return this.ui.waitForState(selector, 'hidden', timeout);
  }

  protected getText(selector: string): Promise<string> {
    return this.ui.getText(selector);
  }

  currentUrl(): string {
    return this.page.url();
  }
}
