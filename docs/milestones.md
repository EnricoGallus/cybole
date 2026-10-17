# CYBOLE milestones

## Direction

Modernize the existing repository and replace the document-handling core in stages.
Keep React, TypeScript, Tauri, the project-selection flow, and useful existing UI
components. Introduce a shared document model before adding language-aware forms.

The first useful outcome is: open a representative CYBOL file, edit a deeply nested
value, save it, and verify that unrelated content survives. A successful dependency
upgrade alone does not establish that the editor is safe to use.

Implement the milestones in order. Complete each acceptance checklist before
starting the next milestone. Keep changes small enough to review independently;
do not combine toolchain migration with the new editor architecture.

## Starting point

Inspection of the current working tree on 2026-10-17 found:

- The manifests use Tauri 1.2, React 18, TypeScript 4.9, and Vite 4. The Tauri 2
  entry in `AGENTS.md` describes the intended target rather than the current code.
- The frontend already uses Vite, but `package.json` retains Create React App
  tooling and Electron packaging configuration. The README is also outdated.
- `src/editor/EditInDataGridFormat.tsx` already uses a PrimeReact TreeTable.
  Its loader maps only two levels and assumes multiple top-level child nodes.
  Its saver reconstructs XML from a fixed set of attributes.
- Both editor implementations write directly to disk. Writes are not awaited
  before updating parent state, and there is no shared document lifecycle.
- `src-tauri/src/main.rs` is primarily application setup, menus, and Sentry;
  there is no substantial custom Rust document engine to preserve.
- TypeScript checking passed. Jest reported four passing suites and three suites
  that could not load because of ES module handling for `tauri-settings`.
  All 12 tests that executed passed. Editor tests primarily cover rendering.
- Native application behavior and a Rust build have not yet been verified.
- There are existing uncommitted changes. Preserve them throughout this work.

These observations are a baseline, not completed milestone tasks.

## Start here: the first three changes

1. **Baseline and test repair:** preserve current work, record the environment,
   repair the Jest dependency boundary, and establish frontend and native checks.
2. **Frontend tooling cleanup:** remove obsolete tooling, update the essential
   frontend toolchain in compatible groups, and document reproducible commands.
3. **Tauri 2 migration:** migrate native configuration and APIs, put filesystem and
   settings access behind typed services, and verify them in the desktop app.

These are reviewable changes, not a requirement to force each into exactly one
commit. Do not begin with a blanket upgrade of every package or a new UI library.

## Milestone 0 — Restore a maintainable application foundation

**Outcome:** a reproducible Tauri 2 application whose existing project and file
operations work, with trustworthy checks and a clear development setup.

### 0.1 Preserve work and establish the baseline

- [ ] Review `git status` and the existing diff. Save or commit the work intentionally;
      do not discard changes, reset the repository, or overwrite local settings.
- [ ] Create a modernization branch once the current work is safely accounted for.
- [ ] Record Node, Yarn, Rust, and Cargo versions. Retain Yarn for this migration
      unless a concrete incompatibility requires changing package managers.
- [ ] Inspect the lockfiles and use the matching Yarn install mode. Do not delete
      lockfiles to resolve dependency conflicts.
- [ ] Run the baseline commands below and record failures before changing code.
- [ ] Launch the existing desktop app when possible. Record whether project opening,
      settings persistence, file loading, and saving work. Use disposable file copies.
- [ ] Choose the first supported desktop platform for local verification. Keep the
      existing macOS, Windows, and Linux CI targets unless scope is explicitly changed.

Initial commands from the repository root:

```sh
node --version
yarn --version
rustc --version
cargo --version
yarn exec tsc --noEmit --incremental false
yarn test --runInBand
yarn build
cargo check --manifest-path src-tauri/Cargo.toml
yarn tauri:dev
```

Use the equivalent local binary invocation if the installed Yarn version requires
it. Record missing platform prerequisites or unavailable targets; do not label
unexecuted checks as passing.

### 0.2 Make the existing checks reliable

- [ ] Fix the Jest ES module failure involving `tauri-settings` in
      `jest.config.ts` and the test setup. Mock persistence at its boundary for UI
      tests; test persistence behavior separately. Do not suppress failing suites.
- [ ] Keep existing useful tests and inspect snapshot differences before accepting them.
- [ ] Add a `typecheck` script. The current TypeScript config includes `src` only;
      give tests and build configuration an explicit type-checking path as needed.
- [ ] Establish working scripts for type checking, tests, linting, and production build.
      Resolve baseline lint failures or document a bounded cleanup task.
- [ ] Keep Jest initially. Reconsider the test runner only if maintaining it becomes
      a demonstrated blocker.

### 0.3 Clean up and update the frontend toolchain

- [ ] Confirm which scripts and configuration are actually used by development and CI.
- [ ] Remove obsolete Electron packaging configuration and Create React App tooling
      after replacing any remaining references, including `test:coverage`.
- [ ] Audit direct dependencies. Remove unused packages based on code/configuration
      references rather than upgrading them automatically.
- [ ] Select a supported Node version compatible with the chosen Vite release.
      Check official compatibility requirements at implementation time and pin the
      development/CI environment consistently.
- [ ] Update Vite, its React plugin, TypeScript, and related tooling in compatible
      groups. Run the checks after each group and review lockfile changes.
- [ ] Retain the current React/PrimeReact interaction patterns initially. Upgrade
      runtime dependencies in separate groups and address their actual API changes.
      Treat a UI-library replacement as a separate decision.
- [ ] Rewrite `README.md` with real prerequisites, setup, test, and Tauri commands.

### 0.4 Migrate the native application to Tauri 2

- [ ] Read the official [Tauri 1 to 2 migration guide](https://v2.tauri.app/start/migrate/from-tauri-1/)
      and check version-specific APIs with Context7 before implementation.
- [ ] Upgrade the CLI, JavaScript API, Rust dependencies, and build dependencies as
      a compatible Tauri 2 set. Use the migration tooling where helpful and review
      every generated change.
- [ ] Migrate `src-tauri/tauri.conf.json`, native setup, menus, and window access.
- [ ] Replace Tauri 1 filesystem/dialog imports with the supported Tauri 2 APIs and
      register the required plugins.
- [ ] Replace the broad v1 allowlist with capabilities for the operations and project
      paths the app actually needs. Verify access to directories selected by the user,
      including after restarting the app.
- [ ] Review `tauri-settings` and Sentry integration for compatibility. If replacing
      persistence, preserve the existing project list and CYBOP path with an explicit
      migration or recoverable import. Do not silently reset user settings.
- [ ] Introduce a small typed platform service for filesystem access, directory
      selection, and settings. Move direct native imports out of React components.
      Do not add custom Rust commands where supported plugins suffice.
- [ ] Make read/write failures visible to callers. Await writes and report success
      only when the write completes.
- [ ] Keep the application identifier and existing settings locations stable where
      possible. Check any deliberate changes for migration consequences.

Likely touch points: `package.json`, `yarn.lock`, `vite.config.ts`, `tsconfig*.json`,
`src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, `src-tauri/tauri.conf.json`,
`src-tauri/src/main.rs`, `src/utils/persister.ts`, and native imports under
`src/editor/` and `src/startScreen/`.

### 0.5 Update CI and verify native behavior

- [ ] Update `.github/workflows/` to the selected Node environment and supported
      Tauri 2 platform prerequisites. Keep package-manager versions consistent.
- [ ] Run type checking and tests explicitly in CI; the existing build workflow
      does not establish that the test suites pass.
- [ ] Build the native app for the declared platform matrix. Review release
      workflows separately from build verification; do not publish a release as
      part of validating the migration.
- [ ] Use Playwright MCP for browser interaction issues and Tauri MCP for native
      APIs, IPC, and webview behavior. Browser success does not prove native success.
- [ ] In the desktop app, select a project directory, read a nested file, save a
      disposable copy, restart, and confirm settings persistence.
- [ ] Exercise dialog cancellation, unreadable files, and failed writes. Confirm
      errors are visible and the UI remains usable.

**Acceptance criteria**

- [ ] Type checks, tests, lint checks, frontend build, and Cargo check pass for the
      changed code; unavailable platform checks are explicitly recorded.
- [ ] Native project opening, file access, and settings persistence are verified.
- [ ] A fresh checkout can follow the README to install and launch the application.
- [ ] The migration has not redesigned the editor or changed CYBOL semantics.

## Milestone 1 — Edit existing CYBOL documents reliably

**Outcome:** a shared document model supporting arbitrary nesting, a structure view,
a property inspector, and safe saving.

### 1.1 Establish the language target and representative fixtures

- [ ] Select the CYBOI version or source revision to support. Record it with links
      to its authoritative grammar, interpreter sources, and example applications.
- [ ] Verify actual element names, attributes, nesting, and reference syntax.
      Do not use historical examples from the design notes as current specifications.
- [ ] Collect a small set of real examples, retaining provenance and checking reuse
      permissions. Start with XML; defer JSON until its representation is verified.
- [ ] Add fixtures for empty documents, a single child, multiple siblings, deeply
      nested nodes, comments, unknown attributes/elements, escaped values, and
      meaningful whitespace. Include malformed input and UTF-8 text.

### 1.2 Prove the parser and serialization strategy before building UI

- [ ] Define separate expectations for semantic preservation and source preservation.
      A no-op open/save should leave the file byte-for-byte unchanged. A small edit
      should preserve unrelated content and avoid rewriting the entire document.
- [ ] Evaluate the existing parser against those fixtures. Check ordering, comments,
      declarations, text, attribute values, and whitespace explicitly.
- [ ] Compare source-range patches or a concrete syntax representation if normal
      parse/serialize cannot meet the requirements.
- [ ] Keep parsing in TypeScript initially if it meets the requirements. Introduce
      Rust parsing only for a concrete benefit; use typed IPC if that decision is made.
- [ ] Record the selected approach and limitations here before connecting it to saving.
      If a document cannot be preserved safely, offer source-only/read-only handling
      with an explanation instead of silently dropping content.

### 1.3 Introduce a UI-independent document model

- [ ] Create a focused document module, for example `src/document/`, independent of
      PrimeReact rows, React components, and filesystem APIs.
- [ ] Represent nested content and all information needed for preservation. Keep
      editor node IDs distinct from CYBOL names and references; do not serialize IDs.
- [ ] Use IDs stable across edits, reordering, and undo within the editing session.
      Decide how selection is reconciled after source reparsing.
- [ ] Implement typed operations to change an attribute, insert a node, delete a node,
      and reorder siblings. Keep language validation separate from XML parsing.
- [ ] Introduce one document session containing source, parsed structure, selection,
      dirty status, diagnostics, and undo/redo history. Keep existing React state
      tools unless their limitations justify another dependency.
- [ ] Add meaningful tests for arbitrary nesting, single-child normalization,
      preservation, edit commands, undo/redo, and serialization of special characters.

### 1.4 Connect the existing UI and add a property inspector

- [ ] Make `Editor.tsx` own or coordinate the document session; both editing views
      must consume the same state instead of maintaining independent serializers.
- [ ] Adapt the existing TreeTable to the document model. Keep row conversion as a
      presentation adapter and remove the current two-level parsing logic.
- [ ] Support expansion, selection, insertion, deletion, and sibling reordering at
      arbitrary depth. Start with explicit buttons; drag and drop can come later.
- [ ] Add a property inspector for the selected element, initially exposing verified
      structural attributes without inventing semantic restrictions.
- [ ] Ensure switching views preserves changes and selection where possible.
- [ ] Provide keyboard access to basic navigation and editing.

### 1.5 Add an explicit document and save lifecycle

- [ ] Replace unconditional writes on each field change with dirty state and explicit
      Save/Save As actions initially. Undo and redo must work before saving.
- [ ] Await persistence; keep the document dirty after a failed write and show the error.
- [ ] Use atomic replacement where supported and account for the selected filesystem
      API's permissions and platform behavior. Avoid partially overwriting a file.
- [ ] Detect external file changes before overwriting and present a conflict choice.
- [ ] Handle unsaved changes when switching files, opening another project, or closing.
- [ ] Display malformed XML diagnostics without overwriting the original file.

**Acceptance criteria**

- [ ] A real fixture can be opened, a deeply nested value edited, saved, and reopened.
- [ ] No-op saving preserves bytes; editing preserves unrelated structure, comments,
      and unknown attributes. Any formatting limitation is explicit and tested.
- [ ] Empty, single-child, and deeply nested documents work without data loss.
- [ ] Undo/redo, failed saves, unsaved changes, and external-change conflicts work.
- [ ] Document tests pass, frontend checks pass, and native saving is verified.
      Run Cargo check and relevant Rust tests if Rust changed.

## Milestone 2 — Add language-aware editing

**Outcome:** users can create a small, verified set of CYBOL structures through
contextual forms and useful diagnostics.

1. [ ] Choose about five representative constructs from the pinned language version:
       values, operations, references, nesting, and control logic where supported.
2. [ ] Create a versioned definition registry with IDs, labels, descriptions,
       supported properties, types, defaults, constraints, and example/source links.
       Keep structural rules separate from operation semantics.
3. [ ] Derive definitions from authoritative metadata where practical. Record the
       evidence for manually maintained rules; represent unknown rules as unknown.
4. [ ] Add a searchable Add menu that creates verified structures through document
       commands and participates in undo/redo.
5. [ ] Generate property forms from the definitions. Start with the field types the
       selected constructs require; add conditional behavior only when evidenced.
6. [ ] Add diagnostics for syntax, structure, required inputs, types, and verified
       compatibility rules. Include node/field locations and distinguish warnings
       from errors. Avoid blocking unfamiliar but potentially valid content.
7. [ ] Explain operations and inputs next to the controls and offer verified examples.
8. [ ] Test valid examples, invalid combinations, and unknown constructs. Build a few
       small programs through the UI and record where raw XML is still necessary.
9. [ ] Validate the examples with the targeted interpreter where available. Report
       interpreter checks separately from editor-only validation.

**Acceptance criteria**

- [ ] The selected constructs can be created and edited without manually writing XML.
- [ ] Forms and validation use the same versioned definitions with source evidence.
- [ ] Diagnostics identify the affected node and input and explain how to resolve it.
- [ ] Unknown constructs survive editing even when semantic assistance is unavailable.
- [ ] Representative programs remain correct after save and reopen.

## Milestone 3 — Add source editing and project intelligence

**Outcome:** the structured editor supports real projects and a reliable source escape hatch.

1. [ ] Evaluate CodeMirror or Monaco against actual requirements and bundle cost;
       integrate one source editor rather than both.
2. [ ] Connect source editing to the same document session and undo policy. When
       source is invalid, retain the user's text and clearly mark the structured
       view as unavailable or stale until reparsing succeeds.
3. [ ] Build a project index for the verified reference syntax; add reference
       completion, navigation, and unresolved-reference diagnostics.
4. [ ] Handle file moves, deleted targets, and changes outside the app. Avoid
       automatically rewriting references until resolution and rename rules are tested.
5. [ ] Add JSON only after verifying its semantics and preservation requirements.
       Keep each file's original format; do not promise lossless XML/JSON conversion
       without tests covering format-specific information.
6. [ ] Add source/structure interaction tests and native multi-file project checks.

**Acceptance criteria**

- [ ] Valid source and structured edits remain synchronized without silent overwrites.
- [ ] Invalid source can be corrected without losing text or saving a stale structure.
- [ ] References resolve across representative project files and failures are actionable.

## Milestone 4 — Integrate CYBOI execution

**Outcome:** run a verified application and inspect its output from the editor.

1. [ ] Verify the selected CYBOI version's actual platform support, launch arguments,
       working-directory requirements, and error behavior.
2. [ ] Choose one supported execution environment first: a local interpreter where
       supported, or an explicitly configured Linux environment where needed.
       Keep execution separate from the cross-platform editor.
3. [ ] Define a typed execution service for start, stop, status, stdout, stderr,
       and exit status. Keep process/platform details outside React components.
4. [ ] Pass structured arguments rather than constructing shell command strings.
       Resolve the entry file and working directory explicitly.
5. [ ] Require a clear save decision when running a dirty document. Show the exact
       entry point and environment being executed.
6. [ ] Add an Output panel, cancellation, and error navigation where reliable source
       locations are provided. Handle missing interpreters and failed launches.
7. [ ] Verify execution and cancellation in the real desktop app with a small program.
       Mocked UI tests do not establish process integration correctness.

**Acceptance criteria**

- [ ] A verified program starts, streams output, exits, and can be stopped.
- [ ] Missing environments, launch errors, and nonzero exits are visible and recoverable.
- [ ] Supported execution environments and untested platforms are documented.

## Milestone 5 — Optional workflow visualization

Start only after the structured editor and language semantics are dependable.

1. [ ] Define which verified control-flow constructs can be visualized faithfully.
2. [ ] Build a read-only view first and distinguish hierarchy, references, and execution
       edges. Do not infer execution order from visual placement alone.
3. [ ] Evaluate React Flow only when the graph requirements justify it.
4. [ ] Select a visual node to navigate to the shared document node and inspector.
5. [ ] Add graphical editing only when every supported action maps to a tested
       document command. Explain unsupported constructs rather than hiding them.

**Acceptance criteria**

- [ ] Visual relationships agree with the targeted interpreter's semantics.
- [ ] Opening or arranging a visualization does not change application behavior.
- [ ] Source and structure views remain available for unsupported constructs.

## Architecture and dependency decisions

```text
CYBOL source + preservation information
                  |
           Parser / edit serializer
                  |
       Shared document session and tree
          /              |             \
 Document commands   Diagnostics   Versioned definitions
          \              |             /
           React views and contextual forms
                  |
       Typed platform / execution services
                  |
        Tauri plugins or focused Rust commands
```

| Area | Starting decision | Reconsider when |
| --- | --- | --- |
| Desktop | Migrate existing Tauri app to version 2 | A concrete platform requirement cannot be met |
| Frontend | Retain React, TypeScript, and Vite | A demonstrated limitation requires a change |
| Tree/table | Reuse PrimeReact initially | Required navigation or accessibility cannot be implemented reasonably |
| XML handling | Prove preservation before choosing a parser | Existing parsing cannot meet the fixture-based contract |
| Forms | Begin with current controls and typed definitions | Repeated form complexity justifies a form/schema library |
| State | A shared document session using existing React tools | Cross-view state or history becomes difficult to maintain |
| Source editor | Evaluate one editor in milestone 3 | Source editing requirements are established |
| Workflow | Defer; evaluate React Flow in milestone 5 | Execution semantics and graph scope are verified |

Library names from the original design are candidates, not an installation checklist.
Do not add a Rust parser, a state library, a form library, and a graph library in the
foundation milestone.

## Completion and verification policy

For every implementation change:

1. Run TypeScript checks after frontend changes and relevant automated tests.
2. Run Cargo check after Rust changes and relevant Rust tests where present.
3. Use Playwright MCP for frontend interaction investigation and Tauri MCP for
   native integration investigation, following `AGENTS.md`.
4. Record executed checks, results, limitations, and remaining blockers in the change
   description. Do not substitute browser testing for native verification.
5. Update this checklist only after the corresponding behavior is implemented and
   verified. Keep evidence and unresolved decisions close to the relevant milestone.

The immediate next task is **0.1 and 0.2: preserve the working tree, establish the
baseline, and restore reliable checks**. The first editor feature follows a verified
Tauri 2 foundation and a proven document-preservation strategy.
