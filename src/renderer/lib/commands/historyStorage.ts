// src/renderer/src/lib/commands/historyStorage.ts
// Utility for persistent command history in browser and Electron

const STORAGE_KEY = 'commandHistory'

// Detect if running in Electron
function isElectron(): boolean {
  // @ts-ignore: Accessing custom electron property on window for environment detection
  return typeof window !== 'undefined' && window.electron && window.electron.ipcRenderer
}

export async function loadHistory(): Promise<string[]> {
  if (isElectron()) {
    try {
      // @ts-ignore: Using Electron's IPC renderer for persistent history
      const result = await window.electron.ipcRenderer.invoke('history:load')
      if (Array.isArray(result)) return result
    } catch {
      // fallback below
    }
  }
  // Browser/local fallback
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export async function saveHistory(history: string[]): Promise<void> {
  if (isElectron()) {
    try {
      // @ts-ignore: Using Electron's IPC renderer for persistent history
      await window.electron.ipcRenderer.invoke('history:save', history)
      return
    } catch {
      // fallback below
    }
  }
  // Browser/local fallback
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}
