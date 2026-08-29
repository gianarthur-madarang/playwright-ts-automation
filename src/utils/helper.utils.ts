/** Generic helpers. The used subset of cpm-automation's HelperUtils. */

const ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function randomString(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += ALPHANUMERIC.charAt(Math.floor(Math.random() * ALPHANUMERIC.length));
  }
  return result;
}

export function timestamp(): string {
  return Date.now().toString();
}

/**
 * Unique test-data name, mirroring BrandsPage.fillBrandField's "Auto-<field>-<random>" idiom.
 *
 * Mandatory on this target: the OrangeHRM demo is shared, and its Job Titles list already
 * holds records from other people's automation runs. Fixed names collide.
 */
export function uniqueName(prefix: string): string {
  return `Auto-${prefix}-${timestamp()}-${randomString(4)}`;
}

/** Filesystem-safe fragment of a scenario name, for screenshot and trace filenames. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
