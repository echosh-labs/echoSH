import { CommandDefinition, CommandResult } from '../types'
import { SoundBlueprint } from '@/renderer/lib/audio/audioBlueprints.ts'

// A soft, short "tick" to accompany the readout.
const tick: SoundBlueprint = {
  sources: [{ type: 'oscillator', oscillatorType: 'sine', frequency: 880 }],
  envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.02 },
  duration: 0.06
}

export const dateCommand: CommandDefinition = {
  name: 'date',
  description: 'Prints the current date and time.',
  soundBlueprint: tick,
  execute: (): CommandResult => {
    const now = new Date()
    return {
      output: now.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  },
  argSet: []
}
