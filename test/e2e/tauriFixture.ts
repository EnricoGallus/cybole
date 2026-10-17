import type { Page } from '@playwright/test';

interface FixtureOptions {
    projects?: ProjectSchema[];
    dialogResults?: Array<string | null>;
    storeError?: string;
}

interface FixtureState {
    settings: SettingSchema;
    writes: Array<{ path: string; content: string }>;
    files: Record<string, string>;
}

declare global {
    interface Window {
        __CYBOLE_TEST__: FixtureState;
    }
}

// Browser UI tests emulate IPC only. They do not establish native permissions,
// filesystem behavior, dialog behavior, or real settings persistence.
export async function installTauriFixture(page: Page, options: FixtureOptions = {}) {
    await page.addInitScript(options => {
        const storageKey = 'cybole-browser-test-settings';
        const settings = JSON.parse(localStorage.getItem(storageKey) ?? JSON.stringify({
            projects: options.projects ?? [{ name: 'Demo project', path: '/fixtures/demo' }],
            pathToCybop: '',
        })) as SettingSchema;
        const state: FixtureState = {
            settings,
            writes: [],
            files: {
                '/fixtures/demo/models/hello.cybol': '<node><node name="first" channel="inline" format="string" model="one"/><node name="second" channel="inline" format="string" model="two"/></node>',
            },
        };
        window.__CYBOLE_TEST__ = state;
        const dialogResults = [...(options.dialogResults ?? [])];
        Object.defineProperty(window, '__TAURI_INTERNALS__', {
            value: {
                invoke: async (command: string, args: unknown = {}, invocation?: { headers?: Record<string, string> }) => {
                    const payload = args as { key: string; value: unknown; paths: string[]; path: string };
                    switch (command) {
                        case 'plugin:path|resolve_directory': return '/fixture-config';
                        case 'plugin:path|join': return payload.paths.join('/');
                        case 'plugin:store|load':
                            if (options.storeError) throw new Error(options.storeError);
                            return 1;
                        case 'plugin:store|get': {
                            const key = payload.key as keyof SettingSchema;
                            return [settings[key], key in settings];
                        }
                        case 'plugin:store|set':
                            if (payload.key === 'projects') settings.projects = payload.value as ProjectSchema[];
                            else if (payload.key === 'pathToCybop') settings.pathToCybop = payload.value as string;
                            else throw new Error(`Unknown settings key: ${payload.key}`);
                            return;
                        case 'plugin:store|save':
                            localStorage.setItem(storageKey, JSON.stringify(settings));
                            return;
                        case 'plugin:dialog|open': return dialogResults.shift() ?? null;
                        case 'plugin:fs|read_dir':
                            if (payload.path === '/fixtures/demo') return [
                                { name: 'models', isDirectory: true, isFile: false, isSymlink: false },
                                { name: 'loop', isDirectory: false, isFile: false, isSymlink: true },
                            ];
                            if (payload.path === '/fixtures/demo/models') return [
                                { name: 'hello.cybol', isDirectory: false, isFile: true, isSymlink: false },
                            ];
                            throw new Error(`Unknown directory: ${payload.path}`);
                        case 'plugin:fs|read_text_file':
                            if (!(payload.path in state.files)) throw new Error('File not found');
                            return Array.from(new TextEncoder().encode(state.files[payload.path]));
                        case 'plugin:fs|write_text_file': {
                            const path = decodeURIComponent(invocation?.headers?.path ?? '');
                            const content = new TextDecoder().decode(args as Uint8Array);
                            state.files[path] = content;
                            state.writes.push({ path, content });
                            return;
                        }
                        default: throw new Error(`Unexpected fixture IPC: ${command}`);
                    }
                },
            },
        });
    }, options);
}
