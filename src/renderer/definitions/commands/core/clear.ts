// file: src/renderer/src/definitions/commands/core/clear.ts
import { CommandDefinition } from '../types'
import { SoundBlueprint } from '../../../lib/audio/audioBlueprints'

/**
 * A subtle "swoosh" sound made from filtered white noise.
 * The low-pass filter softens the noise, and the percussive envelope
 * with zero sustain creates a quick, clean sweeping effect.
 */
const clearSound: SoundBlueprint = {
  sources: [{ type: 'noise', noiseType: 'white' }],
  filter: {
    type: 'biquad',
    filterType: 'lowpass',
    frequency: 1200, // Cut off harsh high-end frequencies.
    Q: 1.5
  },
  envelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0.0, // A sustain of 0 makes the sound percussive.
    release: 0.2
  },
  duration: 0.305 // The sum of attack, decay, and release.
}

export const clearCommand: CommandDefinition = {
  name: 'clear',
  description: 'Clears the terminal output.',
  staticActions: ['clearHistory'],
  soundBlueprint: clearSound,
  execute: () => ({
    output: ''
  })
}