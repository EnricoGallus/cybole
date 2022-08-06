import {IElectronAPI} from "./renderer";

declare global {
    interface Window {
        /** APIs for Electron IPC */
        electron: IElectronAPI
    }
}

// Makes TS sees this as an external modules so we can extend the global scope.
export { };