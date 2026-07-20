import { contextBridge, ipcRenderer } from "electron";
import { AppInitData } from "@/renderer/types/app";
import {
  ClaudeAskRequest,
  ClaudeChunk,
  ClaudeError,
  ClaudeToolCall,
  ClaudeToolResult,
} from "@/renderer/types/claude";

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
      /** Summarised reasoning so far. Restarts on each tool-loop iteration. */
      onThinking: (text: string) => void;
      onDone: (text: string) => void;
      onError: (message: string) => void;
    },
  ) => {
    const chunk = (_e: unknown, data: ClaudeChunk) => {
      if (data.id === id) handlers.onChunk(data.text);
    };
    const thinking = (_e: unknown, data: ClaudeChunk) => {
      if (data.id === id) handlers.onThinking(data.text);
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
      ipcRenderer.off("claude:thinking", thinking);
      ipcRenderer.off("claude:done", done);
      ipcRenderer.off("claude:error", error);
    }

    ipcRenderer.on("claude:chunk", chunk);
    ipcRenderer.on("claude:thinking", thinking);
    ipcRenderer.on("claude:done", done);
    ipcRenderer.on("claude:error", error);

    return cleanup;
  },

  /**
   * Registers the handler that executes Claude's tool calls. Tools run in the
   * renderer because that's where the audio engine lives. Registered once at
   * startup, not per request.
   */
  onClaudeToolCall: (
    handler: (
      call: ClaudeToolCall,
    ) => Promise<Omit<ClaudeToolResult, "id" | "toolUseId">>,
  ) => {
    const listener = (_e: unknown, call: ClaudeToolCall) => {
      handler(call)
        .then((result) => {
          const payload: ClaudeToolResult = {
            id: call.id,
            toolUseId: call.toolUseId,
            ...result,
          };
          ipcRenderer.send("claude:tool_result", payload);
        })
        .catch((reason: unknown) => {
          // Main blocks the turn until it hears back, so a thrown handler must
          // still produce a result — as an error Claude can read and adapt to.
          const payload: ClaudeToolResult = {
            id: call.id,
            toolUseId: call.toolUseId,
            content: reason instanceof Error ? reason.message : String(reason),
            isError: true,
          };
          ipcRenderer.send("claude:tool_result", payload);
        });
    };

    ipcRenderer.on("claude:tool", listener);
    // Braced so the callback returns void rather than `ipcRenderer` — React
    // effect destructors must not return a value.
    return () => {
      ipcRenderer.off("claude:tool", listener);
    };
  },
};

console.log("Preload script loaded");
contextBridge.exposeInMainWorld("BRIDGE", BRIDGE);
