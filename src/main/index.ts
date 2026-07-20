import { app, BrowserWindow, shell } from 'electron'
import * as path from 'path'

import dotenv from "dotenv";
dotenv.config()

const isDev = process.env.DEV != undefined;
const isPreview = process.env.PREVIEW != undefined;

console.log('Starting main process');

import './api'
import './claude'

/**
 * Applies Apple's native "Liquid Glass" material (macOS 26+) to the window via
 * the optional `electron-liquid-glass` dependency. It's gated to darwin and
 * lazy-required inside a try/catch so that on Windows/Linux — where the package
 * is OS-skipped and never installed — this is a harmless no-op.
 */
function applyLiquidGlass(win: BrowserWindow): boolean {
  if (process.platform !== 'darwin') return false
  try {
    const mod = require('electron-liquid-glass')
    const liquidGlass = mod?.default ?? mod
    liquidGlass.addView(win.getNativeWindowHandle(), {
      cornerRadius: 14,
      tintColor: '#0d1117aa'
    })
    // The liquid-glass view hides the traffic lights unless we re-show them.
    win.setWindowButtonVisibility?.(true)
    return true
  } catch (err) {
    console.warn('[liquid-glass] effect unavailable, falling back:', err)
    return false
  }
}

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 500,
    minHeight: 372,
    // ...(process.platform === 'linux' ? { icon } : {}),
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: 'rgba(13,17,23,0)',
      symbolColor: '#C9D1D9',
      height: 54
    },
    // Liquid-glass window: a frosted, translucent frame.
    //   - macOS 26+: Apple's native "Liquid Glass" via electron-liquid-glass,
    //                applied after creation (requires transparent: true and
    //                no vibrancy). See the applyLiquidGlass() call below.
    //   - Windows 11: acrylic background material (frosted desktop). Note that
    //                Windows dims acrylic on inactive windows, so the frost
    //                softens a little when the window loses focus — that's an
    //                unavoidable OS behaviour and the cost of real frosted-blur.
    // The window stays non-transparent on Windows so the OS rounds the corners;
    // on macOS transparency is required and corners are rounded by the effect.
    backgroundColor: '#00000000',
    roundedCorners: true,
    ...(process.platform === 'darwin'
      ? { transparent: true }
      : { backgroundMaterial: 'acrylic' as const }),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },

  })

  // macOS-only native liquid glass (no-op elsewhere). The window is created
  // with `transparent: true` on darwin, which the glass effect fills in. If the
  // effect can't be applied (older macOS, or the native module failed to load),
  // fall back to a native vibrancy material so the window isn't left fully
  // transparent — and if even that fails, paint a solid opaque background.
  if (process.platform === 'darwin' && !applyLiquidGlass(mainWindow)) {
    try {
      mainWindow.setVibrancy('under-window')
    } catch {
      mainWindow.setVibrancy(null)
      mainWindow.setBackgroundColor('#0d1117')
    }
  }

  // Use the built-in `isPackaged` property to check for development mode
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    // ^^^^ make sure this port
    // matches the port used when
    // you run 'npm run dev'
    mainWindow.webContents.openDevTools();
  } else if (isPreview) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadFile("dist/index.html");
    // 3. ^^^^^ this 'dist' folder will be our output folder
  } else {
    mainWindow.loadFile("dist/index.html");
  }

  // Force external links to open in the system browser and deny in-app
  // navigation. Registered here (rather than only on the first window) so that
  // windows re-created on macOS `activate` also get the handler.
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  return mainWindow;
}



app.whenReady().then(() => {

  createWindow()

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
