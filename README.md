# CYBOLE

A desktop editor for CYBOL projects, built with React, TypeScript, Vite, and Tauri.
It provides project-directory navigation, a tree-table editor, and an XML editor.

The checked-in application currently uses **Tauri 1, React 18, Vite 4, and
TypeScript 4.9**. Migration to Tauri 2 and a more capable document model is planned
in [the milestones](docs/milestones.md). The existing tree-table serializer has
limited nesting and preservation support; use copies of important CYBOL files
while developing it.

## Prerequisites

- Node.js and Yarn Classic **1.22.22**. `packageManager` records the Yarn version;
  it does not install Yarn by itself.
- A Rust toolchain compatible with the dependencies in `src-tauri/Cargo.lock`.
- The native build prerequisites for your OS: Xcode Command Line Tools on macOS,
  C++ Build Tools and WebView2 on Windows, or the Tauri 1 GTK/WebKit development
  packages on Linux. See [Tauri 1 prerequisites](https://v1.tauri.app/v1/guides/getting-started/prerequisites/).

The existing GitHub workflows still select Node 16. They need a coordinated
Node/Vite/Tauri update; this tooling cleanup does not establish a new supported
Node version or migrate the native application.

## Install and develop

From the repository root:

```sh
yarn install --frozen-lockfile
yarn tauri:dev
```

`tauri:dev` starts Vite through the hook in `src-tauri/tauri.conf.json`, then starts
the native desktop app. Do not start a second Vite server on the same port.
Vite uses port **5173** with `strictPort`, matching Tauri's development URL.

To work on browser-rendered UI alone:

```sh
yarn dev
```

Open <http://localhost:5173>. Native filesystem, dialog, and settings operations
require the Tauri app; a browser session does not provide those APIs.
`yarn dev` transpiles TypeScript and provides hot reload, but does not type-check.
Run `yarn typecheck` separately while developing.

## Commands

| Command | Purpose |
| --- | --- |
| `yarn dev` | Start the Vite frontend development server |
| `yarn typecheck` | Check the frontend, Node configuration files, and tests |
| `yarn build` | Run all TypeScript checks, then build the frontend into `dist/` |
| `yarn preview` | Preview an existing frontend build; native APIs remain unavailable |
| `yarn tauri:dev` | Run the desktop application in development |
| `yarn tauri:build` | Build/package the desktop app, running `yarn build` first |
| `yarn test --runInBand` | Run the Jest test suite once |
| `yarn test:watch` | Run Jest in watch mode |
| `yarn test:coverage` | Run Jest with coverage in `coverage/` |
| `yarn lint` | Check frontend, tests, and JavaScript/TypeScript configuration files |
| `yarn lint:fix` | Apply available ESLint fixes; review the resulting changes |

There is no standalone formatter configured. `lint:fix` applies lint fixes and
is not a replacement for a dedicated formatting tool.

## How the TypeScript and build configuration fits together

| File | Scope and role |
| --- | --- |
| `tsconfig.base.json` | Shared strictness, module resolution, interoperability, and no-output settings |
| `tsconfig.json` | Browser/React code in `src`, with DOM and Vite client types |
| `tsconfig.node.json` | `vite.config.ts` and `jest.config.ts`, with Node types |
| `tsconfig.test.json` | Source and tests together, with Jest/Node/DOM types and CommonJS for ts-jest |
| `test/tsconfig.json` | Editor-discoverable entry point extending the same test configuration |
| `vite.config.ts` | React transformation, development server, and bundle targets |
| `jest.config.ts` | Test discovery, ts-jest using the test tsconfig, CSS mocks, and coverage |
| `.eslintrc.cjs` | ESLint 8 rules for TypeScript and React Hooks |
| `src-tauri/tauri.conf.json` | Native application configuration and frontend build/dev hooks |

`yarn typecheck` invokes `tsc -p` explicitly for all three environments. There are
no project references or emitted TypeScript build artifacts. `tsc` validates types;
Vite emits the frontend JavaScript. See [Vite 4's TypeScript guide](https://v4.vite.dev/guide/features.html#typescript).

Editors discover `test/tsconfig.json` when opening test files. It extends
`tsconfig.test.json`, matching the configuration used by Jest and the command-line
type check, including the shared declarations in `src/@types/`.

The compiler uses an ES2021 library baseline. Vite's `build.target` separately
controls output syntax (`es2021`, `chrome100`, and `safari13`, retained from the
existing configuration). Those targets do not polyfill runtime APIs or prove
compatibility with every desktop webview. The old Electron Browserslist and
packaging fields have been removed; Tauri owns desktop packaging.

The legacy XML editor uses the `stream` browser shim, which imports `emitter` but
expects `emitter-component`'s API. Vite explicitly aliases that import to
`emitter-component`, declared as a direct runtime dependency. This replaces the
unrelated `emitter` package previously listed in development dependencies.

Vite's `TAURI_DEBUG` handling retains debug source maps and disables minification
for debug native builds. Only intentionally public values should use the `VITE_`
or `TAURI_` environment prefixes, since Vite can expose them to frontend code.

## Testing and verification

```sh
yarn typecheck
yarn lint
yarn test --runInBand
yarn build
cargo check --manifest-path src-tauri/Cargo.toml
```

The UI tests mock the application's persistence service with fresh in-memory
settings for each test. The directory-dialog interaction test also mocks the
native dialog. These tests do not verify native persistence or filesystem access.
Rendering snapshots alone do not establish safe XML round trips.

After native changes, also launch the desktop app and check project selection,
file reading/writing, dialog cancellation, and settings after restarting. Run
Cargo checks after Rust changes. Report any platform checks you could not run.

## Repository layout

- `src/editor/`: project navigation and editing views.
- `src/startScreen/`: project selection and settings.
- `src/utils/`: shared frontend utilities and persistence integration.
- `src/@types/`: existing shared type declarations.
- `src-tauri/`: Rust application, native configuration, and assets.
- `test/`: Jest tests, mocks, and snapshots.
- `docs/milestones.md`: ordered modernization and editor-development plan.

## Next maintenance work

Complete the baseline/native checks, then migrate Tauri and its plugins to version
2. Update Node, Vite, React, and their tooling in compatible groups, with CI updated
alongside them. The package cleanup removes unused direct dependencies but does
not imply that the remaining versions are current or that the project has passed
a security audit.
