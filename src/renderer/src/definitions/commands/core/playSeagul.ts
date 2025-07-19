// file: src/renderer/src/definitions/commands/core/playSeagull.ts
import { CommandDefinition, CommandResult } from '../types'
import { SoundBlueprint } from '../../../lib/audio/audioBlueprints'

/**
 * @description An advanced blueprint to simulate a seagull's call. This version uses
 * multiple, dissonant oscillators and a carefully shaped filter and envelope to
 * create the characteristic chaotic, nasal squawk.
 */
const seagullByTheOceanBlueprint: SoundBlueprint = {
  duration: 1.5, // A slightly shorter, punchier event.

  sources: [
    // The core of the squawk - two harsh, high-frequency oscillators.
    {
      type: 'oscillator',
      oscillatorType: 'sawtooth',
      frequency: 1150
    },
    // This oscillator is tuned to a sharp, dissonant interval to create chaos.
    {
      type: 'oscillator',
      oscillatorType: 'square',
      frequency: 1300,
      detune: -30 // Detuning enhances the chaotic, beating effect.
    },
    // A third oscillator adds another layer of complexity and noise.
    {
        type: 'oscillator',
        oscillatorType: 'sawtooth',
        frequency: 1600,
        detune: 40
    },
    // The "ocean" - brown noise for a low-end rumble.
    {
      type: 'noise',
      noiseType: 'brown'
    }
  ],

  // The envelope is crucial for the percussive, yet present, squawk.
  envelope: {
    attack: 0.03,  // A very sharp attack.
    decay: 0.2,    // Quick decay into the main body of the sound.
    sustain: 0.15, // A short but non-zero sustain to give the squawk presence.
    release: 1.2   // A long release for the "ocean" to fade out naturally.
  },

  // A peaking filter is better for creating a "nasal" or "honking" sound.
  filter: {
    type: 'biquad',
    filterType: 'peaking',
    frequency: 1400, // The center of the frequency we want to emphasize.
    Q: 4.0,          // A sharp Q to create a resonant peak.
    gain: 25         // A significant boost (in dB) to make it really squawk.
  },

  // Distortion adds a layer of natural-sounding grit.
  distortion: {
    amount: 35,
    oversample: '4x'
  },

  // The compressor helps blend the loud squawk with the quieter ocean rumble.
  compressor: {
    threshold: -28.0,
    knee: 25.0,
    ratio: 12.0,
    attack: 0.003, // Fast attack to catch the aggressive start of the call.
    release: 0.7
  },
};

export const playSeagullCommand: CommandDefinition = {
  name: 'play:seagull',
  description: 'Generates an improved sound of a seagull squawking by the ocean.',

  execute: (): CommandResult => {
    return {
      output: 'A seagull squawks... hopefully more realistically this time.',
      soundBlueprint: seagullByTheOceanBlueprint
    }
  }
}