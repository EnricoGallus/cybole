import { join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';

export { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

export interface ProjectEntry {
    name: string;
    path: string;
    children?: ProjectEntry[];
}

export async function readProjectDirectory(path: string): Promise<ProjectEntry[]> {
    const entries = await readDir(path);
    return Promise.all(entries.filter(entry => !entry.isSymlink).map(async entry => {
        const entryPath = await join(path, entry.name);
        return {
            name: entry.name,
            path: entryPath,
            ...(entry.isDirectory ? { children: await readProjectDirectory(entryPath) } : {}),
        };
    }));
}

export async function selectProjectDirectory(): Promise<string | null> {
    return open({ directory: true, multiple: false, recursive: true });
}

export async function selectInterpreter(): Promise<string | null> {
    return open({ directory: false, multiple: false });
}
