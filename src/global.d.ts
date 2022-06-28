export {};

declare global {
    interface Window {
        electron: {
            openDialog(func: string, options: OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>,
            getFiles: any,
            readFile: any,
        }
    }
}