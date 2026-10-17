# Project Instructions

## Technology
- Tauri 2
- React
- TypeScript
- Rust

## Development

- Prefer established React and TypeScript patterns.
- Keep Tauri commands and platform-specific logic
  separated from React UI components.
- Prefer typed interfaces for communication between
  frontend and Rust.
- Avoid unnecessary dependencies and abstractions.

## MCP Usage

### Context7
Use Context7 when implementing unfamiliar APIs or
checking version-specific documentation.

Prioritize official documentation for Tauri, React,
and Rust.

### Playwright
Use Playwright MCP to investigate browser-rendered
UI problems and test frontend interactions.

### Tauri
Use Tauri MCP when debugging the desktop application,
native functionality, webview behavior, or IPC.

Do not assume successful browser testing proves that
native Tauri functionality works.

## Verification

- Run available TypeScript checks after frontend changes.
- Run cargo check after Rust changes.
- Run relevant automated tests.
- Report any checks that could not be executed.