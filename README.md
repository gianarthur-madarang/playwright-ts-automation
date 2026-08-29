# playwright-ts-automation

BDD UI automation: **cucumber-js + Playwright + TypeScript**.
POC target: the **Admin module** of the OrangeHRM OS 5.9 public demo.

## Setup

Needs Node.js 22+. If `node -v` / `npm -v` don't work in your terminal, install Node via
[nvm](https://github.com/nvm-sh/nvm) first:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# restart your terminal, or: source ~/.zshrc
nvm install 22
nvm use 22
```

Then install the project:

```bash
npm install
npm run install:browsers
cp .env.example .env
```

## Run

```bash
npm test                      # everything
npm run test:smoke            # @smoke only
npm run test:userManagement   # one page (the runner-class equivalent)
npm run test:jobTitles
npm run test:login
npm run test:headed           # watch it run
npm run test:failed           # rerun only last run's failures

npx cucumber-js --tags '@admin and @smoke'   # ad-hoc, no config file needed
```

## Reports

| Output | Path |
|---|---|
| HTML report | `reports/cucumber-report.html` |
| JUnit XML (CI) | `reports/junit.xml` |
| Trace of a failure | `reports/traces/<scenario>.zip` |

Replay a failure step by step: `npx playwright show-trace reports/traces/<scenario>.zip`

## Architecture

Five layers. Each knows one thing and is ignorant of the one below it.

| Layer | Lives in | Knows | Never |
|---|---|---|---|
| 1 Feature | `features/` | Business intent | Selectors, URLs, waits |
| 2 Steps | `src/steps/` | Sentence to page-object call; assertions | Selectors |
| 3 Pages | `src/pages/` | One screen; **all selectors** | What a scenario is proving; never asserts |
| 4 UiUtils | `src/utils/ui.utils.ts` | How to interact with *an* element | Any selector or screen |
| 5 Playwright | `node_modules` | How to drive Chromium | Your app |

**Cross-cutting:** `src/world/` holds per-scenario state and lazily builds page objects (DI);
`src/hooks/` owns the browser lifecycle and failure capture.

### Three rules

1. A selector string may appear **only** in a `*.page.ts`.
2. **Page objects return, steps assert.** A page object calling `expect` has stolen the step's job.
3. **No fixed test data.** The demo is shared — generate unique names, never assert on a row
   position or a total record count.

## Where does my change go?

| You want to | Touch |
|---|---|
| Add a scenario using existing steps | the `.feature` file only |
| Add a scenario needing a new action | `.feature` + `.steps.ts` + `.page.ts` |
| Fix a selector the app changed | one `.page.ts` |
| Cover a new Admin screen | new page + steps + feature dir + one `cucumber.js` profile line |
| Point at another environment | `src/config/env/` + `TEST_ENV` |
| Add an interaction primitive | `src/utils/ui.utils.ts` |

## Quality

```bash
npm run typecheck
npm run lint
npm run format
```

A failing test run exits non-zero. There is no `testFailureIgnore` equivalent.
