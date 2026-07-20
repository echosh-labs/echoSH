import { contextBridge, ipcRenderer } from "electron";
import { AppInitData } from "@/renderer/types/app";
import { ClaudeAskRequest, ClaudeChunk, ClaudeError } from "@/renderer/types/claude";

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
  saveSettings: async (historyData: any) =>
    await ipcRenderer.invoke("settings:save", historyData),

  // --- Claude ---
  /** Fire a prompt at Claude. Replies arrive on the listeners below. */
  askClaude: (request: ClaudeAskRequest) => {
    ipcRenderer.send("claude:ask", request);
  },
  cancelClaude: (id: string) => {
    ipcRenderer.send("claude:cancel", { id });
  },
  /** Forget the conversation so the next prompt starts fresh. */
  resetClaude: () => {
    ipcRenderer.send("claude:reset");
  },
  /**
   * Subscribes to one request's stream. `onChunk` receives the full response so
   * far. Returns an unsubscribe function — call it once the request settles.
   */
  onClaudeStream: (
    id: string,
    handlers: {
      onChunk: (text: string) => void;
      onDone: (text: string) => void;
      onError: (message: string) => void;
    },
  ) => {
    const chunk = (_e: unknown, data: ClaudeChunk) => {
      if (data.id === id) handlers.onChunk(data.text);
    };
    const done = (_e: unknown, data: ClaudeChunk) => {
      if (data.id !== id) return;
      cleanup();
      handlers.onDone(data.text);
    };
    const error = (_e: unknown, data: ClaudeError) => {
      if (data.id !== id) return;
      cleanup();
      handlers.onError(data.message);
    };

    // Named so every listener is removed on the first terminal event — leaving
    // them attached would leak one set per `claude` invocation.
    function cleanup(): void {
      ipcRenderer.off("claude:chunk", chunk);
      ipcRenderer.off("claude:done", done);
      ipcRenderer.off("claude:error", error);
    }

    ipcRenderer.on("claude:chunk", chunk);
    ipcRenderer.on("claude:done", done);
    ipcRenderer.on("claude:error", error);

    return cleanup;
  },
};

console.log("Preload script loaded");
contextBridge.exposeInMainWorld("BRIDGE", BRIDGE);
