// file: src/renderer/src/definitions/commands/core/diagSound.ts
import { CommandDefinition, CommandResult } from "../types";
import { SoundBlueprint } from "../../../lib/audio/audioBlueprints";

/**
 * @description A complex diagnostic sound to test the audio engine's capabilities.
 * This blueprint generates a "system alert" sound with multiple layers:
 * - A primary and secondary oscillator for a harmonized tone.
 * - Pink noise for a softer atmospheric effect.
 * - A bandpass filter to create a focused, "radio-like" quality.
 * - Distortion for added grit and texture.
 * - A stereo panner to demonstrate spatialization.
 */
const digitalZenGardenBlueprint: SoundBlueprint = {
  // A long duration for an unhurried, atmospheric sound.
  duration: 6.0,

  // Sources are chosen for their smooth and non-abrasive qualities.
  sources: [
    {
      type: "oscillator",
      oscillatorType: "sine", // The purest, smoothest waveform.
      frequency: 130.81 // A low C3 note, providing a stable, grounding bass tone.
    },
    {
      type: "oscillator",
      oscillatorType: "sine",
      frequency: 196.0, // G3, the perfect fifth of C3, creating a consonant, open harmony.
      detune: 5 // A very slight detune adds subtle movement and warmth.
    },
    {
      type: "noise",
      noiseType: "pink" // Pink noise sounds more natural and "calm" than white noise, like gentle rainfall.
    }
  ],

  // The envelope is designed for the gentlest possible transitions.
  envelope: {
    attack: 2.5, // A very slow fade-in, allowing the sound to emerge gradually.
    decay: 1.0, // A slow decay into the sustain level.
    sustain: 0.6, // A relatively high sustain level to maintain the sound's presence.
    release: 2.5 // A long, slow fade-out for a smooth disappearance.
  },

  // A low-pass filter to remove high frequencies, enhancing the warmth and softness.
  filter: {
    type: "biquad",
    filterType: "lowpass",
    frequency: 900, // Cut off the higher, potentially "hissy" frequencies.
    Q: 0.707 // A low Q value ensures a very gentle, natural-sounding filter slope.
  },

  // A subtle delay adds a sense of space and gentle rhythm.
  delay: {
    delayTime: 0.8, // A long delay time creates a sparse, "rippling" effect.
    feedback: 0.35, // Low feedback ensures the echoes fade out gracefully without cluttering the sound.
    mix: 0.3 // A low mix keeps the delay in the background.
  },

  // Reverb would be ideal here to create a sense of a large, open space.
  reverb: {
    decay: 4.5, // A long, cathedral-like reverb tail.
    mix: 0.4, // A significant amount of reverb to create a spacious feel.
    reverse: false
  },

  // A compressor ensures a smooth, consistent volume without any sudden peaks.
  compressor: {
    threshold: -18.0,
    knee: 20.0,
    ratio: 4.0, // A gentle compression ratio.
    attack: 0.5, // Slow attack to preserve the soft entry of the sound.
    release: 1.0 // Slow release for a smooth dynamic response.
  }
};
export const testCommand: CommandDefinition = {
  name: "test",
  description: "Triggers a complex diagnostic sound to test the audio engine.",

  // The execute function is the key. It returns the blueprint to the processor.
  execute: (): CommandResult => {
    return {
      output: "Executing audio diagnostics... A complex sound should play.",
      // The dynamically generated blueprint is attached here.
      soundBlueprint: digitalZenGardenBlueprint
    };
  },
  argSet: []
};
