import type { EnvConfig } from '../env';

/** OrangeHRM public demo. Replaces data/properties/qa.properties. */
export const qa: EnvConfig = {
  name: 'qa',
  baseUrl: 'https://opensource-demo.orangehrmlive.com',
  appPath: '/web/index.php',
  loginPath: '/web/index.php/auth/login',
  actionTimeout: 15_000,
  expectTimeout: 15_000,
  navigationTimeout: 45_000,
};
