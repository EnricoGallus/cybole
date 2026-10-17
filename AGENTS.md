# Project Instructions

## Current application

CYBOLE is a desktop editor for CYBOL projects. It currently provides project
selection, directory navigation, settings, a PrimeReact tree-table editor, and an
XML editor. Read `README.md` for setup and `docs/milestones.md` for planned work.

The current stack is:

- Tauri **2.12.x**, with `@tauri-apps/api` on the frontend and Rust edition 2021.
- React 19, React Router 6, TypeScript 6.0, and Vite 8.
- PrimeReact 10, PrimeFlex, and PrimeIcons for the UI.
- `fast-xml-parser` for tree-table XML conversion and `react-xml-editor` for XML editing.
- Tauri filesystem/dialog/store/persisted-scope plugins; typed frontend access
  lives in `src/platform/files.ts` and `src/utils/persister.ts`.
- Vitest 5 for unit/service tests, React Testing Library for hook tests, and
  Playwright for browser behavior tests in Chromium and WebKit; ESLint 8 for linting.
- Yarn Classic 1.22.22, with `yarn.lock` and `src-tauri/Cargo.lock` tracked.

Use APIs compatible with the installed versions. TypeScript is intentionally pinned
to 6.0.x: the installed TypeScript ESLint parser supports versions below 6.1. Vitest
removes the ts-jest constraint, but does not make the lint parser TypeScript 7-ready.
Do not bypass peer requirements or suppress unsupported-version warnings to claim
a complete compiler migration.

## Code layout and boundaries

- `src/editor/`: project file tree, tree-table editing, and XML editing.
- `src/startScreen/`: project selection, recent projects, and settings screens.
- `src/utils/`: shared frontend utilities and persistence integration.
- `src/@types/`: existing ambient application declarations, including
  `SettingSchema`, `ProjectSchema`, `CybolNode`, `DataRow`, and `EditorProps`.
- `src-tauri/src/main.rs`: native application setup, menus, windows, and Sentry.
- `src-tauri/build.rs`: invokes `tauri_build::build()`.
- `src/platform/`: filesystem traversal and native dialog/file adapters.
- `test/`: Vitest tests and setup; `test/e2e/` holds Playwright tests and fixture IPC.

React components use the platform/persistence services; XML serialization still
lives in the editor components. Keep platform access behind small typed services
and document operations separate from presentation. Prefer typed frontend/Rust
interfaces when custom commands are needed. Avoid unnecessary dependencies and
abstractions; reuse established React/TypeScript patterns and existing controls.

The tree-table loader currently handles only two node levels, and saving rebuilds
XML from a fixed set of attributes. Do not assume it preserves arbitrary nesting,
comments, or unknown content. Use disposable file copies for manual editing checks.
Before expanding document editing, add meaningful preservation and round-trip tests.
Verify CYBOL semantics against the selected CYBOI version rather than historical
examples in design notes.

## Configuration and build

- `tsconfig.base.json` holds shared strict, isolated-module, and no-emit settings.
- `tsconfig.json` covers browser/React code in `src`, with DOM and Vite client types.
- `tsconfig.node.json` covers `vite.config.ts`, `vitest.config.ts`, and `playwright.config.ts`, with Node types.
- `tsconfig.test.json` includes source, unit tests, and browser tests with shared
  declarations and Vite/Node types. Import Vitest and Playwright APIs explicitly.
  Tests use ES modules and bundler resolution, matching Vite.
- `test/tsconfig.json` extends the test configuration so editors discover it.
  Keep this entry point when changing test configuration; a passing explicit CLI
  check alone does not establish editor project discovery.
- `yarn typecheck` explicitly checks all three environments. There are no TypeScript
  project references. Do not add test-runner or Node globals to the frontend configuration
  to fix a test-only typing problem.
- Vite transpiles and bundles; it does not type-check. `yarn build` runs type checks
  before generating `dist/`. Keep TypeScript's `noEmit` behavior.
- Vite uses port 5173 with `strictPort`, matching Tauri's development URL. Native
  dev/build hooks already start or build the frontend; avoid duplicate dev servers.
- Tauri build hooks, frontend paths, and packaging settings live in
  `src-tauri/tauri.conf.json`. Do not add Electron packaging fields to `package.json`.
- Vite aliases `events` to the browser `events/` package for the XML editor's
  `xml2js` dependency. Preserve this mapping unless the dependency chain is replaced.
- Tauri capabilities grant filesystem commands in the main window. Paths are
  granted by directory selection, persisted across restarts, and restored for
  legacy saved projects from the settings file. Keep the application identifier
  `org.enchan.cybole` and `settings.json` in the app-config directory stable.
- Tauri reads the application version from `package.json`; Cargo currently matches it.
- `package.json` uses ES modules; the ESLint configuration is `.eslintrc.cjs`.
  There is no standalone formatter. `yarn lint:fix` applies ESLint fixes only.

Use Yarn for dependency changes and keep the lockfile synchronized. Remove unused
packages based on source, configuration, and transitive runtime requirements.
Keep major dependency migrations separate from editor redesign. Node 24 is recorded
in `.node-version` and selected by CI; keep it compatible with Vite/Vitest and
coordinate changes across local setup and all workflows.

## MCP usage

### Context7

Use Context7 when implementing unfamiliar APIs or checking version-specific
behavior. Prioritize official Tauri, React, TypeScript, and Rust documentation,
and check that examples match the installed major versions.

### Playwright

Use Playwright MCP to investigate browser-rendered UI problems and verify frontend
interactions. Browser-only Vite sessions do not provide native Tauri APIs.

### Tauri

Use Tauri MCP when debugging the desktop application, native functionality, webview
behavior, or IPC. Successful browser tests do not prove native functionality works.

## Verification

Run checks appropriate to the changed files:

- Frontend, tests, or TypeScript configuration: `yarn typecheck` and relevant Vitest
  tests; use `yarn test` for the full unit suite.
- Lintable code or lint configuration: `yarn lint`. Review automatic fixes.
- Dependencies, Vite configuration, or build scripts: `yarn build`; confirm
  `yarn install --frozen-lockfile` remains consistent with the manifest.
- Coverage configuration: `yarn test:coverage`.
- UI changes: `yarn test:e2e`; install browsers using
  `yarn playwright install chromium webkit` first. Playwright builds and serves the
  frontend on port 5175. Failure screenshots/traces are debugging output, not
  snapshot baselines.
- Rust changes: `cargo check --manifest-path src-tauri/Cargo.toml` and relevant Rust
  tests when present.
- Native integration or packaging changes: verify the real desktop app using
  `yarn tauri:dev` and, when relevant, `yarn tauri:build`. Check directory selection,
  file reads/writes, cancellation, failures, and settings persistence after restart.

Vitest checks the form hook and persistence adapter with native modules mocked at
the boundary. Playwright tests use fixture IPC and browser-local settings to check
visible behavior, editing, and save requests. Keep fixture IPC inside test code;
never bundle it into the application. These browser tests do not establish native
permissions, disk persistence, or dialog behavior. Verify those separately. Prefer
behavior assertions over component markup or screenshot snapshots. Preserve XML
round-trip tests when introducing a document model.

Report executed checks, remaining warnings, and any checks that could not be run.
Do not claim native verification based on mocked tests. Documentation-only changes
do not require rerunning application tests.
