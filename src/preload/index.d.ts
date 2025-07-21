import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI & {
      ipcRenderer: {
        invoke: (channel: 'history:load') => Promise<string[]>
        send: (channel: 'history:save', commands: string[]) => void
      }
    }
  }
}
