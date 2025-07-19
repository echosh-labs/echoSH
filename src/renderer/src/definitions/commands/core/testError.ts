// file: src/renderer/src/definitions/commands/core/testError.ts
import { CommandDefinition } from '../types'

export const testErrorCommand: CommandDefinition = {
  name: 'test:error',
  description: 'Triggers the custom error sound for testing.',
  soundBlueprint: {
    sources: [
      { type: 'oscillator', oscillatorType: 'square', frequency: 150 },
      {
        type: 'oscillator',
        oscillatorType: 'square',
        frequency: 150 * Math.pow(1.05946, 6), // Tritone
        detune: 10
      }
    ],
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 },
    duration: 0.5
  },
  execute: () => ({
    output: 'Error: This is a test error.'
  })
}