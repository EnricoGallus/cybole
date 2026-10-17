// @vitest-environment node
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { load, type Store } from '@tauri-apps/plugin-store';
import { Persister } from '../src/utils/persister';

vi.mock('@tauri-apps/api/path', () => ({
    appConfigDir: vi.fn().mockResolvedValue('/legacy/config'),
    join: vi.fn((...parts: string[]) => Promise.resolve(parts.join('/'))),
}));
vi.mock('@tauri-apps/plugin-store', () => ({ load: vi.fn() }));

describe('Tauri settings compatibility', () => {
    const get = vi.fn();
    const set = vi.fn();
    const save = vi.fn();
    let settings: Persister;

    beforeEach(() => {
        settings = new Persister();
        get.mockReset();
        set.mockReset().mockResolvedValue(undefined);
        save.mockReset().mockResolvedValue(undefined);
        vi.mocked(load).mockReset().mockResolvedValue({ get, set, save } as unknown as Store);
    });

    test('loads the original settings file without replacing saved projects', async () => {
        const projects = [{ name: 'existing', path: '/project' }];
        get.mockResolvedValue(projects);

        await expect(settings.get().get('projects')).resolves.toEqual(projects);
        expect(load).toHaveBeenCalledWith('/legacy/config/settings.json', {
            defaults: { pathToCybop: '', projects: [] }, autoSave: false,
        });
        expect(set).not.toHaveBeenCalled();
        expect(save).not.toHaveBeenCalled();
    });

    test('uses a default only when a key is absent', async () => {
        get.mockResolvedValue(undefined);
        await expect(settings.get().get('projects')).resolves.toEqual([]);
        get.mockResolvedValue('/existing/cyboi');
        await expect(settings.get().get('pathToCybop')).resolves.toBe('/existing/cyboi');
        expect(load).toHaveBeenCalledTimes(1);
    });

    test('reports a failed save instead of claiming persistence succeeded', async () => {
        save.mockRejectedValue(new Error('disk full'));
        await expect(settings.get().set('pathToCybop', '/cyboi')).rejects.toThrow('disk full');
        expect(set).toHaveBeenCalledWith('pathToCybop', '/cyboi');
    });

    test('keeps load errors visible and permits a retry', async () => {
        vi.mocked(load).mockRejectedValueOnce(new Error('invalid settings'));
        await expect(settings.get().get('projects')).rejects.toThrow('invalid settings');
        get.mockResolvedValue([]);
        await expect(settings.get().get('projects')).resolves.toEqual([]);
        expect(load).toHaveBeenCalledTimes(2);
    });
});
