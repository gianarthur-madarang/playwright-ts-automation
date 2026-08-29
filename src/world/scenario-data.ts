/**
 * Per-scenario state. The typed counterpart of cpm-automation's GlobalDataUtils.
 *
 * Two differences that matter: every field is optional and typed rather than a bare String,
 * and this object is created fresh per scenario instead of living in a static utility class -
 * so nothing leaks between scenarios or across parallel workers.
 */
export interface ScenarioData {
  // Auth
  loggedInRole?: string;

  // User Management
  username?: string;
  userRole?: string;
  employeeName?: string;
  userStatus?: string;

  // Job Titles
  jobTitle?: string;
  jobDescription?: string;

  // Generic captures for cross-step assertions
  recordCountBefore?: number;
  recordCountAfter?: number;
  toastMessage?: string;
}
