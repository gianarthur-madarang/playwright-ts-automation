import type { Locator, Page } from 'playwright';

/**
 * Element-interaction mechanics. The TypeScript counterpart of the SDK's SharedUiUtils,
 * trimmed to the methods the Playwright pages actually call.
 *
 * Instance-bound to a Page rather than static: a static utility needs a global page,
 * which is exactly what makes parallel runs unsafe.
 *
 * Knows how to interact with AN element. Knows nothing about any specific screen -
 * no selector literals belong in this file.
 */
export class UiUtils {
  constructor(private readonly page: Page) {}

  // ---- Locators ----

  /** Playwright selector engines all work here: css, `xpath=//...`, `text=`, `>> visible=true`. */
  el(selector: string): Locator {
    return this.page.locator(selector);
  }

  // ---- Actions ----

  async click(selector: string): Promise<void> {
    await this.el(selector).first().click();
  }

  /** fill() clears the field before typing, so this covers clearAndFill. */
  async clearAndFill(selector: string, value: string): Promise<void> {
    await this.el(selector).first().fill(value);
  }

  /** Per-keystroke entry, for fields whose validation fires on input rather than change. */
  async clearAndType(selector: string, value: string): Promise<void> {
    const target = this.el(selector).first();
    await target.fill('');
    await target.pressSequentially(value);
  }

  async goToUrl(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  // ---- Waits and state ----

  /**
   * Returns whether the element reached the state, rather than throwing. Keeps the
   * boolean-returning shape the page objects use, so steps assert on the result.
   */
  async waitForState(
    selector: string,
    state: 'visible' | 'hidden' | 'attached' | 'detached',
    timeout?: number,
  ): Promise<boolean> {
    try {
      await this.el(selector).first().waitFor({ state, timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isVisible(selector: string): Promise<boolean> {
    return this.el(selector).first().isVisible();
  }

  async count(selector: string): Promise<number> {
    return this.el(selector).count();
  }

  // ---- Reads ----

  async getText(selector: string): Promise<string> {
    return (await this.el(selector).first().innerText()).trim();
  }

  async getTextList(selector: string): Promise<string[]> {
    const texts = await this.el(selector).allInnerTexts();
    return texts.map((text) => text.trim());
  }
}
