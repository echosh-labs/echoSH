import { contextBridge, ipcRenderer } from "electron";
import { AppInitData } from "@/renderer/types/app";

console.log("[PRELOAD] Loaded at", Date.now());

export const BRIDGE = {
  // Listen for push
  onAppInit: (callback: (data: AppInitData) => void) => {
    ipcRenderer.on("app:init", (_event, data) => callback(data));
  },
  removeAppInitHandler: () => {
    ipcRenderer.removeAllListeners("app:init");
  },
  // Allow pull
  requestAppInit: () => {
    ipcRenderer.send("request:appInit");
  },
  onLoadHistory: (callback: (history: any) => void) => {
    ipcRenderer.on("load:history", (_event, data) => callback(data));
  },
  removeHistoryListeners: () => {
    ipcRenderer.removeAllListeners("load:history");
  },
  saveHistory: async (historyData: any) => {
    await ipcRenderer.invoke("history:save", historyData);
  },
};

console.log("Preload script loaded");
contextBridge.exposeInMainWorld("BRIDGE", BRIDGE);
