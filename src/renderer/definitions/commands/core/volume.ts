import { CommandDefinition, CommandResult } from '../types'
import { audioEngine } from '@/renderer/lib/audio/audioEngine.ts'

export const volumeCommand: CommandDefinition = {
  name: 'volume',
  description: 'Gets or sets the master volume (0–100).',
  execute: (args = []): CommandResult => {
    if (!args[0]) {
      const pct = Math.round(audioEngine.getMasterVolume() * 100)
      const muted = audioEngine.isMuted() ? ' (muted)' : ''
      return { output: `Volume: ${pct}%${muted}` }
    }

    const value = parseFloat(args[0])
    if (isNaN(value)) {
      return { output: `Invalid volume: '${args[0]}'. Provide a number 0–100.` }
    }

    audioEngine.setMasterVolume(value / 100)
    const pct = Math.round(audioEngine.getMasterVolume() * 100)
    return { output: `Volume set to ${pct}%` }
  },
  argSet: [
    { placeholder: 'level', description: 'Master volume from 0 to 100.' }
  ]
}
