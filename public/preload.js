// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");

// As an example, here we use the exposeInMainWorld API to expose the browsers
// and node versions to the main window.
// They'll be accessible at "window.versions".
process.once("loaded", () => {
    contextBridge.exposeInMainWorld("versions", process.versions);
    contextBridge.exposeInMainWorld('electron', {
        openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config),
        getFiles: (directory) => ipcRenderer.invoke('getFiles', directory),
        readFile: (basePath, relativePathToFile) => ipcRenderer.invoke('readFile', basePath, relativePathToFile),
        writeFile: (pathToFile, content) => ipcRenderer.invoke('writeFile', pathToFile, content),
        getAppDescription: () => ipcRenderer.invoke('getAppDescription'),
        openContextMenu: (rowData) => ipcRenderer.invoke('openContextMenu', rowData),
        on: (channel, listener) => {
            ipcRenderer.on(channel, listener);
        },
    });
});