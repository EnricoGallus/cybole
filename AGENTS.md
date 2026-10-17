# Project Instructions

## Current application

CYBOLE is a desktop editor for CYBOL projects. It currently provides project
selection, directory navigation, settings, a PrimeReact tree-table editor, and an
XML editor. Read `README.md` for setup and `docs/milestones.md` for planned work.

The current stack is:

- Tauri **1.2.x**, with `@tauri-apps/api` on the frontend and Rust edition 2021.
- React 18, React Router 6, TypeScript 4.9, and Vite 4.
- PrimeReact 8, PrimeFlex, and PrimeIcons for the UI.
- `fast-xml-parser` for tree-table XML conversion and `react-xml-editor` for XML editing.
- `tauri-settings` behind `src/utils/persister.ts` for persisted settings.
- Jest 29, ts-jest, jsdom, and React Testing Library for tests; ESLint 8 for linting.
- Yarn Classic 1.22.22, with `yarn.lock` and `src-tauri/Cargo.lock` tracked.

Tauri 2 is a planned migration, not the current implementation. Use APIs compatible
with the installed versions. Do not introduce Tauri 2 plugins or TypeScript 5-only
options without updating the relevant dependencies and configuration together.

## Code layout and boundaries

- `src/editor/`: project file tree, tree-table editing, and XML editing.
- `src/startScreen/`: project selection, recent projects, and settings screens.
- `src/utils/`: shared frontend utilities and persistence integration.
- `src/@types/`: existing ambient application declarations, including
  `SettingSchema`, `ProjectSchema`, `CybolNode`, `DataRow`, and `EditorProps`.
- `src-tauri/src/main.rs`: native application setup, menus, windows, and Sentry.
- `src-tauri/build.rs`: invokes `tauri_build::build()`.
- `test/`: tests, snapshots, setup, and persistence mocks.

Some React components currently import native APIs directly and serialize their own
XML. For new or refactored code, keep platform access behind small typed services
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
- `tsconfig.node.json` covers `vite.config.ts` and `jest.config.ts`, with Node types.
- `tsconfig.test.json` includes source and tests, shared declarations, Jest/Node
  types, and CommonJS output semantics for ts-jest.
- `test/tsconfig.json` extends the test configuration so editors discover it.
  Keep this entry point when changing test configuration; a passing explicit CLI
  check alone does not establish editor project discovery.
- `yarn typecheck` explicitly checks all three environments. There are no TypeScript
  project references. Do not add Jest or Node globals to the frontend configuration
  to fix a test-only typing problem.
- Vite transpiles and bundles; it does not type-check. `yarn build` runs type checks
  before generating `dist/`. Keep TypeScript's `noEmit` behavior.
- Vite uses port 5173 with `strictPort`, matching Tauri's development URL. Native
  dev/build hooks already start or build the frontend; avoid duplicate dev servers.
- Tauri build hooks, frontend paths, and packaging settings live in
  `src-tauri/tauri.conf.json`. Do not add Electron packaging fields to `package.json`.
- Vite aliases `emitter` to `emitter-component` for the legacy XML editor's stream
  shim. Preserve this compatibility mapping unless the dependency chain is replaced.
- `package.json` uses ES modules; the ESLint configuration is `.eslintrc.cjs`.
  There is no standalone formatter. `yarn lint:fix` applies ESLint fixes only.

Use Yarn for dependency changes and keep the lockfile synchronized. Remove unused
packages based on source, configuration, and transitive runtime requirements.
Keep major dependency migrations separate from editor redesign. Existing CI still
selects Node 16; coordinate runtime, build-tool, and CI updates rather than assuming
local Node compatibility establishes CI support.

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

- Frontend, tests, or TypeScript configuration: `yarn typecheck` and relevant Jest
  tests; use `yarn test --runInBand` for the full suite.
- Lintable code or lint configuration: `yarn lint`. Review automatic fixes.
- Dependencies, Vite configuration, or build scripts: `yarn build`; confirm
  `yarn install --frozen-lockfile` remains consistent with the manifest.
- Coverage configuration: `yarn test:coverage`; do not use Create React App tooling.
- Rust changes: `cargo check --manifest-path src-tauri/Cargo.toml` and relevant Rust
  tests when present.
- Native integration or packaging changes: verify the real desktop app using
  `yarn tauri:dev` and, when relevant, `yarn tauri:build`. Check directory selection,
  file reads/writes, cancellation, failures, and settings persistence after restart.

UI tests mock the persistence service with fresh in-memory settings per test. The
project-directory dialog test mocks the native dialog. Keep these tests isolated
from native storage; verify real persistence and filesystem behavior separately.
Inspect snapshot changes before accepting them. Snapshots do not establish XML
round-trip correctness.

Report executed checks, remaining warnings, and any checks that could not be run.
Do not claim native verification based on mocked tests. Documentation-only changes
do not require rerunning application tests.
