import {FileResult} from "./FileResult";
import { TreeFile } from '@geist-ui/core/dist/tree';
import {OpenDialogOptions, OpenDialogReturnValue} from "electron";

export interface IElectronAPI {
    openDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
    getFiles(directory: string): Promise<TreeFile>;
    readFile(basePath: string, relativePathToFile: string): Promise<FileResult>;
    writeFile(pathToFile: string, content: string): void;
    getAppDescription(): Promise<string>;
    openContextMenu(rowData: DataRow): void;
    on: (channel: string, listener: (event: any, ...arg: any) => void) => void;
}