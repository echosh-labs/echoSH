import { CommandDefinition, CommandResult } from '../types'
import { audioEngine } from '@/renderer/lib/audio/audioEngine.ts'

export const muteCommand: CommandDefinition = {
  name: 'mute',
  description: 'Toggles the master output mute.',
  execute: (): CommandResult => {
    const muted = audioEngine.toggleMute()
    return { output: muted ? '🔇 Muted' : '🔊 Unmuted' }
  },
  argSet: []
}
