// src/renderer/src/types/index.ts

// This uses module augmentation to add our custom ipcRenderer properties
// directly to the ElectronAPI interface from the @electron-toolkit/preload package.
// This is the idiomatic way to extend third-party types in TypeScript.
declare module '@electron-toolkit/preload' {
  interface ElectronAPI {
    ipcRenderer: {
      invoke: (channel: 'history:load') => Promise<string[]>
      send: (channel: 'history:save', commands: string[]) => void
    }
  }
}
