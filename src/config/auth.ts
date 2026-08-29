/** Single source of truth for the cached-admin-session file, shared by auth.setup.ts
 *  (which writes it) and playwright.config.ts (which points the "admin" project at it). */
export const ADMIN_AUTH_FILE = 'playwright/.auth/admin.json';
