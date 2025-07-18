import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  ipcRenderer: {
    // Functions for renderer to invoke main process methods
    invoke: (channel: 'history:load'): Promise<string[]> => ipcRenderer.invoke(channel),
    // Functions for renderer to send data to main process
    send: (channel: 'history:save', commands: string[]): void => ipcRenderer.send(channel, commands)
  }
}

// Use `contextBridge` to securely expose APIs to the renderer process
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', { ...electronAPI, ...api })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = { ...electronAPI, ...api }
}
