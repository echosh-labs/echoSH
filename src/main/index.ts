import { app, BrowserWindow, shell } from 'electron'
import * as path from 'path'

// Force GTK3 to avoid conflicts with native modules that might be linked against it.
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('gtk-version', '3');
}
console.log('Starting main process');

import "./api";

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    // ...(process.platform === 'linux' ? { icon } : {}),
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: 'rgba(13,17,23,0)',
      symbolColor: '#C9D1D9',
      height: 54
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },

  })
  // Use the built-in `isPackaged` property to check for development mode
  if (!app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
    // mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  }
  else {
    mainWindow.loadFile(path.join(app.getAppPath(), '../renderer/index.html'))
  }

  return mainWindow;
}



app.whenReady().then(() => {

  const win = createWindow()

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // console.log('Registered IPC handlers');

  app.on('activate', function () {
    // console.log('App activated');
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  console.log('Done app ready');
})

app.on('window-all-closed', () => {
  console.log('Window all-closed');
  if (process.platform !== 'darwin') app.quit();
})
