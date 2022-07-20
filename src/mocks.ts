export function registerElectron() {
    const electronMock = {
        openDialog: jest.fn().mockReturnValue(Promise.resolve({ filePaths: ['directory'] })),
        getFiles: jest.fn(),
        readFile: jest.fn(),
        writeFile: jest.fn(),
        getAppDescription: jest.fn().mockReturnValue(Promise.resolve('Cybole v0.2')),
        openContextMenu: jest.fn(),
        on: jest.fn(),
    };

    window.electron = electronMock;
    return electronMock;
}
