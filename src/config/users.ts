/** Replaces TestDataReader.getUser(role). Roles are resolved by the same
 *  case-insensitive string a feature file uses. */
export interface User {
  username: string;
  password: string;
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'Admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';

const USERS: Record<string, User> = {
  admin: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
  'invalid credentials': { username: 'NotAUser', password: 'WrongPassword123' },
  'empty credentials': { username: '', password: '' },
};

/**
 * NOTE: the OrangeHRM public demo exposes only the Admin account, so the
 * locked-out / no-access roles that cpm-automation covers have no analogue here.
 */
export function getUser(role: string): User {
  const user = USERS[role.trim().toLowerCase()];
  if (!user) {
    throw new Error(`Unknown role "${role}". Available: ${Object.keys(USERS).join(', ')}`);
  }
  return user;
}
