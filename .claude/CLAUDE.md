# CLAUDE.md

Guidance for Claude Code working in this repository.

## Project

BDD UI automation framework: playwright-bdd + @playwright/test + TypeScript.
Gherkin `.feature` files are compiled by `bddgen` and run on the Playwright test runner.
Target under test: the **Admin module** of the OrangeHRM OS 5.9 public demo
(`https://opensource-demo.orangehrmlive.com`, credentials `Admin` / `admin123`,
published on the app's own login page).

Ported from the Java `cpm-automation` suite. UI only — no API layer.

## Commands

```bash
npm install && npm run install:browsers   # first time
npm test                                  # all scenarios
npm run test:smoke
npm run test:userManagement               # page-scoped profile (bddgen --tags)
npm run test:headed                       # non-headless
npm run test:ui                           # Playwright UI Mode
npm run test:failed                       # rerun last failures (--last-failed)
npm run report                            # open the HTML report
npm run typecheck && npm run lint         # before reporting done
```

Each `test:*` script runs `bddgen test --tags "<expr>"` (generates matching specs into
`.features-gen/`) then `playwright test`. On failure the HTML report embeds the screenshot and
a trace; open it with `npm run report`, or a single trace with `npx playwright show-trace`.

## Architecture — five layers

| Layer | Path | Owns | Must never contain |
|---|---|---|---|
| Feature | `features/` | Business intent, tags | Selectors, URLs, waits |
| Steps | `src/steps/` | One page-object call + assertion | Selectors |
| Pages | `src/pages/` | One screen, **all selectors** | Assertions |
| UiUtils | `src/utils/ui.utils.ts` | Element mechanics | Selectors, screens |
| Playwright | — | Browser driving | App knowledge |

Cross-cutting: `src/fixtures.ts` (DI via Playwright fixtures + the per-scenario `data` bag;
this is where `createBdd` exports `Given/When/Then/Before/After`), `playwright.config.ts`
(browser lifecycle, tracing and screenshots — all runner config), `src/hooks/` (tag-scoped
BDD hooks such as `@loginAsAdmin`).

`CommonUIPage` holds furniture shared by all Admin pages — breadcrumb, record count, table,
row actions, Add button, confirm dialog, toast, filters. Screen-specific page objects should
stay thin; if you are adding something to a screen page that any other Admin page also has,
it belongs in `CommonUIPage`.

## Conventions

- **Tags:** feature-level area tag (`@admin`, `@login`) plus a page tag
  (`@userManagement`, `@jobTitles`). `@smoke` marks the critical path. `@bug` / `@wip` are excluded
  from every profile.
- **Adding a page** = new `*.page.ts` + `*.steps.ts` + `features/admin/<page>/` + one
  `test:<page>` script in `package.json` (a `bddgen --tags @<page>` line). The page-per-profile
  taxonomy is deliberate.
- **Routes** live in `CommonUIPage.ROUTES`, keyed by the lowercase name a feature file uses.
- **Step signatures** are arrow functions taking the fixtures object first, then the Gherkin
  params: `Then('…', async ({ commonUI, data }, name: string) => { … })`. Destructure only the
  fixtures the step uses; import `Given/When/Then` from `../fixtures`. A `DataTable` (from
  `playwright-bdd`) is the last argument, after the Gherkin params.
- Files end with a trailing newline.

## Verified selectors (OrangeHRM OS 5.9)

| Concern | Selector |
|---|---|
| Login | `input[name="username"]`, `input[name="password"]`, `button[type="submit"]` |
| Breadcrumb | `.oxd-topbar-header-breadcrumb` (reads e.g. `AdminUser Management`) |
| Record count | text `(N) Records Found` |
| Table header | `.oxd-table-header .oxd-table-th` (strip `AscendingDescending` from textContent) |
| Row | `.oxd-table-card` |
| Row actions | `.oxd-table-cell-actions button` with `.bi-trash` / `.bi-pencil-fill` |
| Confirm dialog | `.orangehrm-dialog-popup`, buttons `Yes, Delete` / `No, Cancel` |
| Toast | `.oxd-toast` (container `.oxd-toast-container--bottom`); success reads `Success / Successfully Saved` |
| Employee autocomplete | `.oxd-autocomplete-option` — **filter out the `Searching` placeholder**, it is an option too |

## Rules

1. A selector may appear only in a `*.page.ts`. Typing `.oxd-` anywhere else means wrong file.
2. Page objects return values; steps assert. Never `expect` inside a page object.
3. No fixed test data — the demo is shared, and its Job Titles list already holds other
   people's automation records. Use `uniqueName()`. Never assert on a row position or total count.
4. No `hardWait`/sleep. Wait on the condition you actually care about.
5. Never assert `record count === rows shown`. OrangeHRM pages at 50 rows, and the shared demo's
   user count crossed that line during development (34 → 52), so User Management now paginates.
   Assert the size-independent invariant instead: count > 0, rows > 0, rows ≤ count.
6. `fullyParallel: true` + `workers: 2` run scenarios concurrently against the live shared demo.
   That's only safe because rule 3 (unique names) holds and no scenario asserts an exact snapshot
   count. Don't add a scenario that captures a count then asserts an exact later value, or that
   mutates a shared/non-unique row - either would race against the other worker.
