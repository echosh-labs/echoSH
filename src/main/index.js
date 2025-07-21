"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var icon_png_asset_1 = require("../../resources/icon.png?asset");

// Force GTK3 to avoid conflicts with native modules that might be linked against it.
if (process.platform === 'linux') {
    electron_1.app.commandLine.appendSwitch('gtk-version', '3');
}
console.log('Starting main process');
require("./api");
function createWindow() {
    var mainWindow = new electron_1.BrowserWindow(__assign(__assign({ width: 900, height: 670 }, (process.platform === 'linux' ? { icon: icon_png_asset_1.default } : {})), { titleBarStyle: 'hidden', titleBarOverlay: {
            color: '#0D1117',
            symbolColor: '#C9D1D9',
            height: 54
        }, webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            // sandbox: false
        } }));
    if (!electron_1.app.isPackaged) {
        mainWindow.loadURL("http://localhost:5173");
        // mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    }
    else {
        mainWindow.loadFile(path.join(electron_1.app.getAppPath(), '../renderer/index.html'));
    }
    return mainWindow;
}
electron_1.app.whenReady().then(function () {
    // console.log('app.whenReady resolved');
    // app.setAppUserModelId('com.electron')
    var win = createWindow();
    win.webContents.setWindowOpenHandler(function (details) {
        electron_1.shell.openExternal(details.url);
        return { action: 'deny' };
    });
    // console.log('Registered IPC handlers');
    electron_1.app.on('activate', function () {
        // console.log('App activated');
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
    console.log('Done app ready');
});
electron_1.app.on('window-all-closed', function () {
    console.log('Window all-closed');
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
