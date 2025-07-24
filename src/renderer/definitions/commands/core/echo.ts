// file: src/renderer/src/definitions/commands/core/clear.ts
import { CommandDefinition } from "../types";
import { SoundBlueprint } from "../../../lib/audio/audioBlueprints";

export const echoEffect: SoundBlueprint = {
  sources: [
    {
      type: "oscillator",
      oscillatorType: "triangle",
      frequency: 700 // Clicky, high-mid frequency for a clear echo
    },
    {
      type: "noise",
      noiseType: "white"
    }
  ],
  envelope: {
    attack: 0.005,
    decay: 0.08,
    sustain: 0.0,
    release: 0.3
  },
  filter: {
    type: "biquad",
    filterType: "highpass",
    frequency: 400,
    Q: 0.7
  },
  delay: {
    delayTime: 0.22, // The echo time in seconds
    feedback: 0.47, // How much of the echo repeats
    mix: 0.34 // Wet/dry mix for an obvious echo
  },
  reverb: {
    decay: 0.4, // A short, "spring-like" reverb tail
    mix: 0.22,
    reverse: false
  },
  panner: {
    type: "stereo",
    pan: 0 // Keep it center, or animate if you want
  },
  compressor: {
    threshold: -28,
    knee: 6,
    ratio: 2.2,
    attack: 0.01,
    release: 0.13
  },
  duration: 0.5
};

export const echoCommand: CommandDefinition = {
  name: "echo",
  description: "Return the provided args back.",
  soundBlueprint: echoEffect,
  execute: (args) => ({
    output: (args ?? []).join(" ")
  }),
  argSet: []
};
