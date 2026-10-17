// UI tests use an isolated settings store instead of loading native persistence.
let settings: SettingSchema;

const manager = {
    get: jest.fn(<K extends keyof SettingSchema>(key: K): Promise<SettingSchema[K]> =>
        Promise.resolve(settings[key])),
    set: jest.fn(<K extends keyof SettingSchema>(key: K, value: SettingSchema[K]): Promise<void> => {
        settings[key] = value;
        return Promise.resolve();
    }),
};

export const resetPersisterMock = () => {
    settings = { pathToCybop: '', projects: [] };
    manager.get.mockClear();
    manager.set.mockClear();
};

resetPersisterMock();

export default { get: () => manager };
