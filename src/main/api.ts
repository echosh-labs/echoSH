import { BrowserWindow, ipcMain } from "electron";
import settings from "electron-settings";
import { HistoryItem } from "@/renderer/types/terminal";
import { AppInitData, AppSettings } from "@/renderer/types/app";

async function saveHistory(history: HistoryItem[] = []): Promise<void> {
  await settings.set("history", history as any);
}
// --- End History Persistence Setup ---

export async function sendAppInit(mainWindow: BrowserWindow) {
  const history = (await settings.get("history")) ?? ([] as unknown as HistoryItem[]);

  const preferences = (await settings.get("settings")) ?? {};

  const payload: AppInitData = {
    arch: process.platform,
    version: require("electron").app.getVersion(),
    history: history as undefined | HistoryItem[],
    settings: preferences as Partial<AppSettings>
  };
  mainWindow.webContents.send("app:init", payload);
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

ipcMain.handle("history:save", (_event, args) => {
  saveHistory(args);
});
ipcMain.handle("settings:save", (_event, userPreferences) => {
  settings.set("settings", userPreferences);
});
