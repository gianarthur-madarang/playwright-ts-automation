import { expect as baseExpect } from '@playwright/test';

import { env } from '../config/env';

/**
 * Project-wide assertion entry point.
 *
 * Playwright's standalone `expect` defaults to a 5s timeout, which is unrelated to the
 * BrowserContext default timeout and too short for this target. Import `expect` from here,
 * never from '@playwright/test' directly, so every assertion shares one configured timeout.
 */
export const expect = baseExpect.configure({ timeout: env.expectTimeout });
