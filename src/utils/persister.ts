import {SettingsManager} from "tauri-settings";

class Persister {
    private readonly settingsManager: SettingsManager<SettingSchema>;

    constructor() {
        this.settingsManager = new SettingsManager<SettingSchema>({'pathToCybop': '', 'projects': []});
        this.settingsManager.initialize().finally(() => console.log('cache initialized'));
    }

    get(): SettingsManager<SettingSchema> {
        return this.settingsManager;
    }
}

export default new Persister();