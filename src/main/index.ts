import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'

// --- History Persistence Setup ---
const userDataPath = app.getPath('userData')
const historyFilePath = path.join(userDataPath, 'command-history.json')

function loadHistory(): string[] {
  try {
    if (fs.existsSync(historyFilePath)) {
      const data = fs.readFileSync(historyFilePath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to load command history:', error)
  }
  return []
}

function saveHistory(commands: unknown[] = []): void {
  try {
    const safeCommands = Array.isArray(commands)
      ? commands.map((c) => String(c))
      : []
    fs.writeFileSync(historyFilePath, JSON.stringify(safeCommands, null, 2))
  } catch (error) {
    console.error('Failed to save command history:', error)
  }
}
// --- End History Persistence Setup ---

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // --- IPC Handlers for History ---
  ipcMain.handle('history:load', loadHistory)
  ipcMain.handle('history:save', (_event, commands: string[]) => {
  saveHistory(commands)
  return true
})// --- End IPC Handlers ---

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
