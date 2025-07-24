/**
 * @file src/renderer/lib/audio/keys/backspace.ts
 * @description Defines the sound blueprint for the backspace key action.
 * This sound provides satisfying, non-intrusive auditory feedback for deletion.
 */

import { SoundBlueprint } from "@/renderer/lib/audio/audioBlueprints.ts";

/** A "swoosh" sound that blends filtered noise with a soft, falling sine wave. */
export const backspaceSwoosh: SoundBlueprint = {
  // A swoosh often blends filtered noise and a soft falling sine for subtlety
  sources: [
    {
      type: "noise",
      noiseType: "white"
    },
    {
      type: "oscillator",
      oscillatorType: "sine",
      frequency: 420, // Start higher for the swoosh down
      detune: -100 // Add a touch of pitch "whoosh"
    }
  ],
  envelope: {
    attack: 0.01,
    decay: 0.08,
    sustain: 0.0,
    release: 0.13
  },
  filter: {
    type: "biquad",
    filterType: "lowpass",
    frequency: 800,
    Q: 1
  },
  lfo: {
    type: "sine",
    frequency: 14, // A fast vibrato to create the "swoosh"
    affects: { target: "source", param: "frequency" },
    depth: 60 // How many Hz the pitch will sweep
  },
  delay: {
    delayTime: 0.07,
    feedback: 0.18,
    mix: 0.14
  },
  panner: {
    type: "stereo",
    pan: 0 // Centered, or animate for more fun
  },
  compressor: {
    threshold: -30,
    knee: 8,
    ratio: 2.5,
    attack: 0.005,
    release: 0.04
  },
  duration: 0.23 // Short and snappy!
};
