import { appConfigDir, join } from '@tauri-apps/api/path';
import { load, type Store } from '@tauri-apps/plugin-store';

const createDefaults = (): SettingSchema => ({ pathToCybop: '', projects: [] });

export interface SettingsStorage {
    get<K extends keyof SettingSchema>(key: K): Promise<SettingSchema[K]>;
    set<K extends keyof SettingSchema>(key: K, value: SettingSchema[K]): Promise<void>;
}

export class Persister implements SettingsStorage {
    private store: Promise<Store> | undefined;

    private getStore(): Promise<Store> {
        // Reuse tauri-settings' original path and flat JSON format, including unknown keys.
        this.store ??= appConfigDir()
            .then(directory => join(directory, 'settings.json'))
            .then(path => load(path, { defaults: createDefaults(), autoSave: false }))
            .catch(error => {
                this.store = undefined;
                throw error;
            });
        return this.store;
    }

    get(): SettingsStorage;
    get<K extends keyof SettingSchema>(key: K): Promise<SettingSchema[K]>;
    get<K extends keyof SettingSchema>(key?: K): SettingsStorage | Promise<SettingSchema[K]> {
        if (key === undefined) return this;
        return this.getStore().then(async store =>
            (await store.get<SettingSchema[K]>(key)) ?? createDefaults()[key]);
    }

    async set<K extends keyof SettingSchema>(key: K, value: SettingSchema[K]): Promise<void> {
        const store = await this.getStore();
        await store.set(key, value);
        await store.save();
    }
}

export default new Persister();
