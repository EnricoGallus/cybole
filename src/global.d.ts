import { TreeFile } from '@geist-ui/core/dist/tree';
import { FileResult } from './editor/FileResult';

export {};

declare global {
    interface Window {
        electron: {
            openDialog(func: string, options: OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>;
            getFiles(directory: string): Promise<TreeFile>;
            readFile(basePath: string, relativePathToFile: string): Promise<FileResult>;
            writeFile(pathToFile: string, content: string);
            getAppDescription(): Promise<string>;
            openContextMenu(rowData: DataRow);
            on: (channel: string, listener: (event: any, ...arg: any) => void) => void;
        };
    }
}
