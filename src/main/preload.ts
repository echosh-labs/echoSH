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
  saveHistory: async (historyData: any) => {
    await ipcRenderer.invoke("history:save", historyData);
  },
  saveSettings: async (historyData: any) => await ipcRenderer.invoke("settings:save", historyData)
};

console.log("Preload script loaded");
contextBridge.exposeInMainWorld("BRIDGE", BRIDGE);
