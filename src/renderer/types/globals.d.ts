
declare const backendAudioEngine: typeof import("./preload").backend;

// This is the idiomatic way to extend third-party types in TypeScript.
declare module Window {
  interface ipcRenderer {
      invoke: (channel: 'history:load') => Promise<string[]>
      send: (channel: 'history:save', commands: string[]) => void
  }
}

