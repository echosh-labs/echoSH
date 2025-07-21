import { SoundBlueprint } from "@/renderer/lib/audio/audioBlueprints.ts";

export const rainbowFlutter: SoundBlueprint = {
  sources: [
    // Layered oscillators to simulate "color"
    { type: 'oscillator', oscillatorType: 'sine', frequency: 700 },
    { type: 'oscillator', oscillatorType: 'triangle', frequency: 900, detune: 40 },
    { type: 'oscillator', oscillatorType: 'sawtooth', frequency: 1200, detune: -30 }
  ],
  envelope: {
    attack: 0.03,
    decay: 0.10,
    sustain: 0.22,
    release: 0.13
  },
  lfo: {
    type: 'sine',
    frequency: 6,       // gentle vibrato
    affects: 'frequency',
    depth: 60
  },
  filter: {
    type: 'biquad',
    filterType: 'bandpass',
    frequency: 1050,
    Q: 8
  },
  delay: {
    delayTime: 0.08,
    feedback: 0.13,
    mix: 0.12
  },
  reverb: {
    mix: 0.22
  },
  panner: {
    type: 'stereo',
    pan: 0.6 // Slight right pan for sparkle (could animate for full rainbow arc!)
  },
  compressor: {
    threshold: -36,
    knee: 6,
    ratio: 2.5,
    attack: 0.01,
    release: 0.11
  },
  duration: 0.36 // Short, magical
};
