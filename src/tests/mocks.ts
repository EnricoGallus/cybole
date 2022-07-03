export function registerElectron() {
    const electronMock = {
        openDialog: jest.fn().mockReturnValue(Promise.resolve({ filePaths: ['directory'] })),
        getFiles: jest.fn(),
        readFile: jest.fn(),
        getAppDescription: jest.fn().mockReturnValue(Promise.resolve('Cybole v0.2')),
    };

    window.electron = electronMock;
    return electronMock;
}
