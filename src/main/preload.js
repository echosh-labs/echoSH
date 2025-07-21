"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
// Custom APIs for renderer
var api = {
    ipcRenderer: {
        // Functions for renderer to invoke main process methods
        invoke: function (channel) { return electron_1.ipcRenderer.invoke(channel); },
        // Functions for renderer to send data to main process
        send: function (channel, commands) { return electron_1.ipcRenderer.send(channel, commands); }
    }
};
// Use `contextBridge` to securely expose APIs to the renderer process
if (process.contextIsolated) {
    try {
        electron_1.contextBridge.exposeInMainWorld('electron', api);
    }
    catch (error) {
        console.error(error);
    }
}
else {
    // @ts-ignore (define in dts)
    window.electron = api;
}
