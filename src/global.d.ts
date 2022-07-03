import { TreeFile } from '@geist-ui/core/dist/tree';

export {};

declare global {
    interface Window {
        electron: {
            openDialog(func: string, options: OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>;
            getFiles(directory: string): Promise<TreeFile>;
            readFile(basePath: string, relativePathToFile: string): Promise<string>;
            getAppDescription(): Promise<string>;
        };
    }
}
