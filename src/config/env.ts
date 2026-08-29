import * as dotenv from 'dotenv';

import { dev } from './env/dev';
import { qa } from './env/qa';

dotenv.config();

/** Shape of a per-environment config. Typed, so a missing key fails at compile time
 *  rather than returning an empty string like PropertyReader.getProperty() did. */
export interface EnvConfig {
  name: string;
  baseUrl: string;
  /** Path prefix every in-app route sits under, e.g. /web/index.php */
  appPath: string;
  loginPath: string;
  actionTimeout: number;
  expectTimeout: number;
  navigationTimeout: number;
}

const ENVIRONMENTS: Record<string, EnvConfig> = { qa, dev };

function resolve(): EnvConfig {
  const requested = process.env.TEST_ENV ?? 'qa';
  const config = ENVIRONMENTS[requested];
  if (!config) {
    throw new Error(
      `Unknown TEST_ENV "${requested}". Available: ${Object.keys(ENVIRONMENTS).join(', ')}`,
    );
  }
  return config;
}

export const env = resolve();

/** Full URL for an in-app route, e.g. appUrl('/admin/viewSystemUsers'). */
export function appUrl(path = ''): string {
  return `${env.baseUrl}${env.appPath}${path}`;
}

/** Full URL of the login page. */
export function loginUrl(): string {
  return `${env.baseUrl}${env.loginPath}`;
}

export const isHeadless = (process.env.HEADLESS ?? 'true') !== 'false';
