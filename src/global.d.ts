export {};

declare global {
    interface Window {
        electron: {
            openDialog: any,
            getFiles: any
        };
    }
}