// Module to control the application lifecycle and the native browser window.
import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import url from "url";
import fs from 'fs';
/*import Sentry from "@sentry/electron";*/
import MenuBuilder from "_main/mainMenu";
import {autoUpdater} from "electron-updater";
import {log, error}  from "electron-log";
/*Sentry.init({ dsn: "https://639261e8fe5846fa8d3a4e78131d5f64@o367548.ingest.sentry.io/6425628" });*/

const isMacOS = process.platform.startsWith('darwin');

const handleFatalError = (err: Error | object | null | undefined) => {
    error(`handling fatal error: ${err}`);
    try {
        // eslint-disable-next-line promise/no-promise-in-callback
        dialog
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .showMessageBox(undefined, {
                type: 'error',
                buttons: ['Okay'],
                title: 'Oops! Something went wrong!',
                detail: 'Help us improve your experience by sending an error report',
                message: `Error: ${err}`,
            })
            .then(() => {
                console.log('received resp from message box');
                process.exit(1);
            })
            .catch((dialogErr) => {
                error('failed to show error dialog', dialogErr.stack);
                process.exit(1);
            });
    } catch (e) {
        /*
          This API can be called safely before the ready event the app module emits, it is usually used to report errors
          in early stage of startup. If called before the app readyevent on Linux, the message will be emitted to stderr,
          and no GUI dialog will appear.
         */
        dialog.showErrorBox('Oops! Something went wrong!', `Error: ${err}`);
        process.exit(1);
    }
};

process.on('uncaughtException', (err: Error) => {
    error(`uncaughtException ${err.message}`, err.stack);
    handleFatalError(err);
});

process.on('unhandledRejection', (err: Error) => {
    error(`unhandledRejection: ${err}`);
    handleFatalError(err);
});

var mainWindow: BrowserWindow | null = null;

// Create the native browser window.
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        center: true,
        minWidth: 800,
        minHeight: 600,
        // Set the path of an additional "preload" script that can be used to
        // communicate between node-land and browser-land.
        webPreferences: {
            preload: path.join(__dirname, "./preload.bundle.js"),
            devTools: process.env.NODE_ENV === "development",
            webSecurity: process.env.NODE_ENV !== "production"
        },
    });

    // In production, set the initial browser path to the local bundle generated
    // by the Create React App build process.
    // In development, set it to localhost to allow live/hot-reloading.
    mainWindow.loadFile("index.html").finally(() => {});

    // Automatically open Chrome's DevTools in development mode.
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();
}

function list(dir: string) {
    const walk = (entry: string) => {
        return new Promise((resolve, reject) => {
            fs.exists(entry, exists => {
                if (!exists) {
                    return resolve({});
                }
                return resolve(new Promise((resolve, reject) => {
                    fs.lstat(entry, (err, stats) => {
                        if (err) {
                            return reject(err);
                        }
                        if (!stats.isDirectory()) {
                            return resolve({
                                name: path.basename(entry),
                                path: entry,
                                type: 'file',
                            });
                        }
                        resolve(new Promise((resolve, reject) => {
                            fs.readdir(entry, (err, files) => {
                                if (err) {
                                    return reject(err);
                                }
                                Promise.all(files.map(child => walk(path.join(entry, child)))).then(children => {
                                    resolve({
                                        name: path.basename(entry),
                                        path: entry,
                                        type: 'directory',
                                        files: children
                                    });
                                }).catch(err => {
                                    reject(err);
                                });
                            });
                        }));
                    });
                }));
            });
        });
    }

    return walk(dir);
}

// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady()
    .then(createWindow)
    .catch((err: Error) => {
        error(`createWindow error ${err}`);
        handleFatalError(err);
    });

app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on("window-all-closed", function () {
    if (isMacOS) {
        app.quit();
    }
});

// If your app has no need to navigate or only needs to navigate to known pages,
// it is a good idea to limit navigation outright to that known scope,
// disallowing any other kinds of navigation.
const allowedNavigationDestinations = "https://my-electron-app.com";
app.on("web-contents-created", (event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        if (!allowedNavigationDestinations.includes(parsedUrl.origin)) {
            event.preventDefault();
        }
    });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.handle('openDialog', (event, params: Electron.OpenDialogOptions) => {
    return dialog.showOpenDialog(params)
});

ipcMain.handle('getFiles', (event, directory) => {
    return list(directory);
});

ipcMain.handle('readFile', (event, basePath, relativePathToFile) => {
    const fullPathToFile = path.join(basePath, '..', relativePathToFile);
    return {
        content: fs.readFileSync(fullPathToFile, 'utf8'),
        fullPathToFile: fullPathToFile
    };
});

ipcMain.handle('writeFile', (event, pathToFile, content) => {
    return fs.writeFileSync(pathToFile, content);
});

ipcMain.handle('getAppDescription', (event) => {
    return app.getName() + ' ' + app.getVersion();
});

ipcMain.handle('openContextMenu', (event, rowData) => {


    const template = [
        {
            label: 'Delete',
            click() {
                mainWindow?.webContents.send('delete-node', rowData)
            }
        },
        {
            label: 'Add Node',
            click() {
                mainWindow?.webContents.send('add-node', rowData)
            }
        },
        {
            label: 'Add SubNode',
            click() {
                mainWindow?.webContents.send('add-subnode', rowData)
            }
        }
    ];
    const menu = Menu.buildFromTemplate(template)
    menu.popup();
});

autoUpdater.autoDownload = false;

autoUpdater.on('error', (err: Error) => {
    error(err, err.stack);
});

autoUpdater.on('update-available', async () => {
    const response = await dialog.showMessageBox(mainWindow!, {
        type: 'info',
        title: 'Found Updates',
        message: 'Found updates, do you want update now?',
        buttons: ['Sure', 'Later'],
    });

    if (response.response === 0) {
        log('Downloading Update');
        autoUpdater.downloadUpdate();
        await dialog.showMessageBox(mainWindow!, {
            type: 'info',
            title: 'Update Downloading',
            message:
                'Update is being downloaded, you will be notified when it is ready to install',
            buttons: [],
        });
    }
});

autoUpdater.on('update-downloaded', async () => {
    const response = await dialog.showMessageBox(mainWindow!, {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: 'Update',
        detail:
            'A new version has been downloaded. Restart the application to apply the updates.',
    });
    if (response.response === 0) {
        setImmediate(() => autoUpdater.quitAndInstall());
    }
});

app.on('ready', async () => {
    // does not work in development and MacOS requires the application to be signed
    if (process.env.NODE_ENV !== 'development' && !isMacOS) {
        try {
            await autoUpdater.checkForUpdates();
        } catch (err) {
            error(err);
        }
    }
});