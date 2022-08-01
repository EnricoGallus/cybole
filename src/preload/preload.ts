// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import { contextBridge, ipcRenderer } from "electron";

// As an example, here we use the exposeInMainWorld API to expose the browsers
// and node versions to the main window.
// They'll be accessible at "window.versions".
process.once("loaded", () => {
    contextBridge.exposeInMainWorld("versions", process.versions);
    contextBridge.exposeInMainWorld('electron', {
        openDialog: (config: Electron.OpenDialogOptions) => ipcRenderer.invoke('openDialog', config),
        getFiles: (directory: string) => ipcRenderer.invoke('getFiles', directory),
        readFile: (basePath: string, relativePathToFile: string) => ipcRenderer.invoke('readFile', basePath, relativePathToFile),
        writeFile: (pathToFile: string, content: string) => ipcRenderer.invoke('writeFile', pathToFile, content),
        getAppDescription: () => ipcRenderer.invoke('getAppDescription'),
        openContextMenu: (rowData: DataRow) => ipcRenderer.invoke('openContextMenu', rowData),
        on: (channel: any, listener: any) => {
            ipcRenderer.on(channel, listener);
        },
    });
});