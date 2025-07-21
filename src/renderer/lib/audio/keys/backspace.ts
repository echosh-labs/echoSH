import { SoundBlueprint } from "@/renderer/lib/audio/audioBlueprints.ts";

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
    frequency: 14,
    affects: "frequency",
    depth: 60 // Pitch sweep for the oscillator
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
