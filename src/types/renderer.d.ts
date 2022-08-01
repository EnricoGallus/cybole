import {FileResult} from "_renderer/editor/FileResult";
import { TreeFile } from '@geist-ui/core/dist/tree';

export interface IElectronAPI {
    openDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>;
    getFiles(directory: string): Promise<TreeFile>;
    readFile(basePath: string, relativePathToFile: string): Promise<FileResult>;
    writeFile(pathToFile: string, content: string): void;
    getAppDescription(): Promise<string>;
    openContextMenu(rowData: DataRow): void;
    on: (channel: string, listener: (event: any, ...arg: any) => void) => void;
}