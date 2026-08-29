import type { EnvConfig } from '../env';

/** Placeholder for a self-hosted OrangeHRM instance. */
export const dev: EnvConfig = {
  name: 'dev',
  baseUrl: process.env.DEV_BASE_URL ?? 'http://localhost:8080',
  appPath: '/web/index.php',
  loginPath: '/web/index.php/auth/login',
  actionTimeout: 15_000,
  expectTimeout: 15_000,
  navigationTimeout: 45_000,
};
