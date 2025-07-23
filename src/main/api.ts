import * as fs from "fs";
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";

// --- History Persistence Setup ---
const userDataPath = app.getPath('userData')
const historyFilePath = path.join(userDataPath, 'command-history.json')
async function loadHistory(): Promise<string[]> {
  try {
    if (!fs.existsSync(historyFilePath)) {
      console.log("Couldn't find user history, creating...");
      fs.writeFileSync(historyFilePath, JSON.stringify([]));
    }
    if (fs.existsSync(historyFilePath)) {
      const data = await fs.promises.readFile(historyFilePath, {encoding: 'utf8'})
      return JSON.parse(data.toString())
    }
  }
  catch (error) {
    console.error('Failed to load command history:', error)
  }
  return []
}

async function saveHistory(commands: unknown[] = []): Promise<void> {
  try {
    const safeCommands = Array.isArray(commands)
      ? commands.map((c) => String(c))
      : []
    await fs.promises.writeFile(historyFilePath, JSON.stringify(safeCommands, null, 2))
  } catch (error) {
    console.error('Failed to save command history:', error)
  }
}
// --- End History Persistence Setup ---

export {
  saveHistory,
  loadHistory,
}

export function sendAppInit(mainWindow: BrowserWindow) {
  const payload = {
    arch: process.platform,
    version: require('electron').app.getVersion(),
    // ...other data
  };
  console.log("[MAIN] sendAppInit payload:", payload);
  mainWindow.webContents.send('app:init', payload);
}


ipcMain.on("request:appInit", (event) => {
  const contents = BrowserWindow.fromWebContents(event.sender);
  console.log("[MAIN] Got request:appInit from webContents id:", event.sender.id);
  if (contents) {
    sendAppInit(contents);
    console.log("[MAIN] Sent app:init to webContents id:", event.sender.id);
  } else {
    console.log("[MAIN] Could not find BrowserWindow for webContents id:", event.sender.id);
  }
});


