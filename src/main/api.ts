import * as fs from "fs";
import { app, ipcMain } from "electron";
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


// --- IPC Handlers for History ---
ipcMain.handle('history:load', loadHistory)
ipcMain.handle('history:save', async (_event, commands: string[]) => {
  await saveHistory(commands)
  return true
})
// --- End IPC Handlers ---
