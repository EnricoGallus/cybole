# CYBOLE

A desktop editor for CYBOL projects, built with React, TypeScript, Vite, and Tauri.
It provides project-directory navigation, a tree-table editor, and an XML editor.

The current stack is **Tauri 2.12, React 19.3, Vite 8.3, and TypeScript 6.0**.
PrimeReact 10 and `react-xml-editor` 0.10.4 provide React 19-compatible controls.
See [the milestones](docs/milestones.md) for the document-model and editor roadmap.
The current tree-table serializer has limited nesting and preservation support;
use disposable copies of important CYBOL files while developing it.

## Prerequisites

- Node.js **24** (recorded in `.node-version` and used by CI). The package currently
  accepts Node 24–26.
- Yarn Classic **1.22.22**. `packageManager` records the version; it does not install it.
- Rust **1.95 or newer** and the native build tools for your OS.
- [Tauri 2 system prerequisites](https://v2.tauri.app/start/prerequisites/): Xcode
  Command Line Tools on macOS, C++ Build Tools/WebView2 on Windows, or the required
  GTK/WebKit development packages on Linux. CI uses WebKitGTK 4.1.

TypeScript remains on **6.0.3** because the TypeScript ESLint parser currently
supports versions below 6.1. Vitest has replaced ts-jest, removing that constraint,
but moving the whole toolchain to TypeScript 7 still requires compatible lint
parsing. Vite and Vitest transpilation is separate from compiler type checking.

## Install and develop

```sh
yarn install --frozen-lockfile
yarn tauri:dev
```

Tauri starts Vite through `src-tauri/tauri.conf.json`, then starts the desktop app.
Vite uses port **5173** with `strictPort`, matching Tauri's development URL. Avoid
starting a second development server on that port.

For browser-rendered UI work, run `yarn dev` and open <http://localhost:5173>.
Native file, dialog, and store operations require the desktop app. The ordinary
browser build does not replace these APIs with mocks. `yarn dev` provides hot
reload and transpilation; run `yarn typecheck` separately for type errors.

## Commands

| Command | Purpose |
| --- | --- |
| `yarn dev` | Start the Vite frontend server |
| `yarn typecheck` | Check frontend, configuration files, and all test code |
| `yarn build` | Run type checks and build the frontend into `dist/` |
| `yarn preview` | Preview an existing frontend build |
| `yarn tauri:dev` | Run the native desktop app in development |
| `yarn tauri:build` | Build/package the desktop app, running the frontend build first |
| `yarn test` | Run Vitest unit/service tests once |
| `yarn test:watch` | Run Vitest interactively in watch mode |
| `yarn test:coverage` | Run unit tests with V8 coverage into `coverage/` |
| `yarn test:e2e` | Build and run Playwright browser behavior tests |
| `yarn test:e2e:ui` | Open Playwright's interactive test runner |
| `yarn lint` | Check frontend, tests, and tool configuration |
| `yarn lint:fix` | Apply available ESLint fixes; review the changes |

There is no standalone formatter configured. ESLint fixes do not provide complete
code formatting.

## Tests

Vitest covers the form hook and the native settings adapter. APIs are imported
explicitly from `vitest`; test globals are not added to the app's TypeScript scope.
Hook tests use jsdom and React Testing Library, with explicit cleanup. Persistence
tests run in Node with native APIs mocked and check the legacy settings path,
defaults, save errors, and retry behavior.

Playwright replaces the component snapshots with behavior tests in **Chromium and
WebKit**. It checks project validation, dialog cancellation, saved project lists,
settings, nested file navigation, table editing, and switching to the XML view.
Install the browsers before the first run:

```sh
yarn playwright install chromium webkit
yarn test:e2e
```

Playwright builds the app and serves it on port **5175**, independently of the
native development server. Tests inject fixture IPC in the test browser and use
browser-local settings for repeatable reload checks. No fixture code is included
in the application. These tests verify UI behavior and persistence requests; they
**do not verify real filesystem permissions, disk writes, or native dialogs**.
Failure screenshots and traces help debugging and are not snapshot baselines.
CI runs browser tests in a separate job and packages the native app on macOS,
Windows, and Linux.

## Configuration responsibilities

| File | Role |
| --- | --- |
| `tsconfig.base.json` | Shared strictness, bundler resolution, and no-emit settings |
| `tsconfig.json` | Browser/React source with DOM and Vite client types |
| `tsconfig.node.json` | Vite, Vitest, and Playwright configuration with Node types |
| `tsconfig.test.json` | Source, unit tests, and browser tests with shared declarations |
| `test/tsconfig.json` | Editor-discoverable entry point for the test configuration |
| `vite.config.ts` | React transformation, server, bundle targets, and browser EventEmitter alias |
| `vitest.config.ts` | Unit discovery, environment, setup, and coverage; inherits Vite configuration |
| `playwright.config.ts` | Browser projects, production-preview server, and failure artifacts |
| `.eslintrc.cjs` | ESLint 8 rules for TypeScript and React Hooks |
| `src-tauri/tauri.conf.json` | Native app configuration, packaging, and frontend hooks |
| `src-tauri/capabilities/main.json` | Main-window plugin permissions |

TypeScript checks all three environments explicitly and emits no JavaScript.
Vite emits the frontend bundle; it does not type-check. The ES2021 TypeScript
library baseline and Vite syntax targets do not polyfill runtime APIs or guarantee
support for every historical webview.

The XML editor's `xml2js` dependency needs EventEmitter in the browser. Vite aliases
`events` to the explicit `events/` package. The former `emitter-component` workaround
is no longer needed by the upgraded XML editor.

## Native migration and settings

The application identifier remains **`org.enchan.cybole`**. Tauri reads its version
from `package.json`, with Cargo aligned to the same version. Existing packaging
options remain in the Tauri configuration, with `bundle.targets` set to `all`.

The official store plugin replaces `tauri-settings`, reusing **`settings.json` in
the app-config directory** and its flat JSON format. Existing project lists,
interpreter paths, and unknown keys are retained. Saves are awaited by the storage
adapter and errors propagate to callers.

Filesystem access is granted to selected project directories and persisted across
restarts. Startup restores access to directories in the legacy saved project list.
The filesystem adapter explicitly traverses directories under Tauri 2 and skips
symlinks to avoid cycles or following links outside a project. The old unrestricted
v1 allowlist has been removed. Sentry is migrated to its Tauri 2 integration.

After native changes, run:

```sh
cargo check --manifest-path src-tauri/Cargo.toml
yarn tauri:dev
```

Check directory selection, nested reads, saving disposable copies, cancellation,
failed operations, and settings after restarting. Use `yarn tauri:build` to verify
packaging. Report unavailable checks explicitly; mocked browser tests do not
substitute for native verification.

## Repository layout

- `src/editor/`: project navigation and editing views.
- `src/startScreen/`: project selection and settings.
- `src/platform/`: typed native file/dialog adapters.
- `src/utils/`: shared frontend utilities and persistence integration.
- `src/@types/`: existing shared declarations.
- `src-tauri/`: Rust application, plugins, configuration, and assets.
- `test/`: Vitest tests and setup; `test/e2e/` contains Playwright tests and fixture IPC.
- `docs/milestones.md`: ordered editor-development plan.
