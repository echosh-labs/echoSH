import { AudioPreset, SoundBlueprint } from "./types";

export const mercuryFundamentalBell: SoundBlueprint = {
  id: "mercury-bell",
  name: "Mercury Orbital Bell (141.27 Hz)",
  sources: [
    { type: "oscillator", oscillatorType: "sine", frequency: 141.27 },
    { type: "oscillator", oscillatorType: "triangle", frequency: 282.54, detune: 5 },
    { type: "oscillator", oscillatorType: "sine", frequency: 423.81, detune: -5 },
    { type: "oscillator", oscillatorType: "sine", frequency: 565.08, detune: 10 },
  ],
  envelope: { attack: 0.005, decay: 0.8, sustain: 0.15, release: 1.2 },
  filter: { type: "lowpass", frequency: 1800, Q: 3 },
  effects: {
    reverb: { decay: 2.5, mix: 0.45 },
    delay: { delayTime: 0.25, feedback: 0.35, mix: 0.2 },
  },
  duration: 2.2,
};

export const intuitionVioletDrone: SoundBlueprint = {
  id: "intuition-violet-drone",
  name: "Intuition (432 Hz Violet Drone)",
  sources: [
    { type: "oscillator", oscillatorType: "sine", frequency: 432 },
    { type: "oscillator", oscillatorType: "triangle", frequency: 216, detune: -5 },
    { type: "oscillator", oscillatorType: "sine", frequency: 864, detune: 7 },
  ],
  envelope: { attack: 0.5, decay: 1.0, sustain: 0.6, release: 1.8 },
  filter: { type: "lowpass", frequency: 850, Q: 2.5 },
  lfo: { type: "sine", frequency: 0.2, depth: 80, target: "filterCutoff" },
  effects: {
    reverb: { decay: 3.5, mix: 0.5 },
    delay: { delayTime: 0.3, feedback: 0.3, mix: 0.25 },
  },
  duration: 3.8,
};

export const idealismCyanArpeggio: SoundBlueprint = {
  id: "idealism-cyan-arpeggio",
  name: "Idealism (528 Hz Solfeggio Ascent)",
  sources: [
    { type: "oscillator", oscillatorType: "sawtooth", frequency: 528 },
    { type: "oscillator", oscillatorType: "triangle", frequency: 660, detune: 10 },
    { type: "oscillator", oscillatorType: "sine", frequency: 792, detune: -10 },
  ],
  envelope: { attack: 0.1, decay: 0.8, sustain: 0.4, release: 1.5 },
  filter: { type: "bandpass", frequency: 1200, Q: 4 },
  effects: {
    delay: { delayTime: 0.22, feedback: 0.45, mix: 0.35 },
    reverb: { decay: 2.8, mix: 0.4 },
  },
  duration: 2.8,
};


export const alchemicalTransmutationDrone: SoundBlueprint = {
  id: "alchemical-drone",
  name: "Tria Prima Quicksilver Drone",
  sources: [
    { type: "oscillator", oscillatorType: "sawtooth", frequency: 108 },
    { type: "oscillator", oscillatorType: "triangle", frequency: 216, detune: 12 },
    { type: "oscillator", oscillatorType: "sawtooth", frequency: 324, detune: -12 },
  ],
  envelope: { attack: 0.8, decay: 1.2, sustain: 0.7, release: 2.0 },
  filter: { type: "lowpass", frequency: 650, Q: 4 },
  lfo: { type: "sine", frequency: 0.3, depth: 150, target: "filterCutoff" },
  effects: {
    reverb: { decay: 4.0, mix: 0.6 },
    delay: { delayTime: 0.4, feedback: 0.5, mix: 0.35 },
  },
  duration: 4.5,
};

export const errorTritone: SoundBlueprint = {
  id: "error-tritone",
  name: "Dissonant Tritone Error",
  sources: [
    { type: "oscillator", oscillatorType: "square", frequency: 150 },
    { type: "oscillator", oscillatorType: "square", frequency: 150 * Math.pow(1.05946, 6), detune: 10 },
  ],
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 },
  filter: { type: "lowpass", frequency: 1200, Q: 2 },
  duration: 0.45,
};

export const backspaceSwoosh: SoundBlueprint = {
  id: "backspace-swoosh",
  name: "Backspace Swoosh",
  sources: [
    { type: "noise", noiseType: "white" },
    { type: "oscillator", oscillatorType: "sine", frequency: 420, detune: -100 },
  ],
  envelope: { attack: 0.01, decay: 0.08, sustain: 0.0, release: 0.13 },
  filter: { type: "lowpass", frequency: 800, Q: 1 },
  lfo: { type: "sine", frequency: 14, depth: 60, target: "frequency" },
  effects: {
    delay: { delayTime: 0.07, feedback: 0.18, mix: 0.14 },
  },
  duration: 0.23,
};

export const rainbowFlutter: SoundBlueprint = {
  id: "rainbow-flutter",
  name: "Rainbow Flutter Synesthesia",
  sources: [
    { type: "oscillator", oscillatorType: "sine", frequency: 700 },
    { type: "oscillator", oscillatorType: "triangle", frequency: 900, detune: 40 },
    { type: "oscillator", oscillatorType: "sawtooth", frequency: 1200, detune: -30 },
  ],
  envelope: { attack: 0.03, decay: 0.10, sustain: 0.22, release: 0.13 },
  lfo: { type: "sine", frequency: 6, depth: 60, target: "frequency" },
  filter: { type: "bandpass", frequency: 1050, Q: 8 },
  effects: {
    delay: { delayTime: 0.08, feedback: 0.13, mix: 0.12 },
    reverb: { decay: 1.2, mix: 0.22 },
    panner: { pan: 0.4 },
  },
  duration: 0.36,
};

export const audioPresets: AudioPreset[] = [
  {
    name: "Mercury Orbital Bell (141.27 Hz)",
    category: "Planetary & Esoteric",
    description: "Tuned to the cosmic frequency of Mercury's planetary rotation and Buddhi discernment.",
    blueprint: mercuryFundamentalBell,
  },
  {
    name: "Intuition (432 Hz Violet Drone)",
    category: "Planetary & Esoteric",
    description: "Foundations Stage 1: The inner staircase of subtle guidance and psychic awakening.",
    blueprint: intuitionVioletDrone,
  },
  {
    name: "Idealism (528 Hz Solfeggio Ascent)",
    category: "Planetary & Esoteric",
    description: "Foundations Stage 2: The ascent of architectural will and philosophical aspiration.",
    blueprint: idealismCyanArpeggio,
  },
  {
    name: "Tria Prima Quicksilver Drone",
    category: "Planetary & Esoteric",
    description: "Deep alchemical drone reconciling Spiritus, Sulfur, and Salt with resonant filter sweeps.",
    blueprint: alchemicalTransmutationDrone,
  },
  {
    name: "Rainbow Flutter",
    category: "Planetary & Esoteric",
    description: "Tri-oscillator shimmering chord with vibrato and spatial dispersion.",
    blueprint: rainbowFlutter,
  },
  {
    name: "808 Kick",
    category: "Percussion",
    description: "Punchy sub-bass kick with rapid pitch descent and warm lowpass filtering.",
    blueprint: {
      id: "808-kick",
      name: "808 Kick",
      sources: [{ type: "oscillator", oscillatorType: "sine", frequency: 150 }],
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.0, release: 0.05 },
      filter: { type: "lowpass", frequency: 500, Q: 1.5 },
      lfo: { type: "sine", frequency: 30, depth: 100, target: "frequency" },
      duration: 0.35,
    },
    rawCommand: "raw osc:sine:150 env:0.01:0.3:0:0.05 dur:0.35 lfo:sine:30:-100:frequency filter:lowpass:500",
  },
  {
    name: "Snare Drum",
    category: "Percussion",
    description: "White noise snap blended with a resonant sine body.",
    blueprint: {
      id: "snare-drum",
      name: "Snare Drum",
      sources: [
        { type: "noise", noiseType: "white" },
        { type: "oscillator", oscillatorType: "sine", frequency: 200 },
      ],
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.0, release: 0.05 },
      filter: { type: "bandpass", frequency: 1500, Q: 5 },
      duration: 0.16,
    },
    rawCommand: "raw noise:white env:0.01:0.1:0:0.05 dur:0.16 filter:bandpass:1500:5 osc:sine:200",
  },
  {
    name: "Closed Hi-Hat",
    category: "Percussion",
    description: "Crisp, metallic hi-hat using highpass filtered white noise.",
    blueprint: {
      id: "closed-hi-hat",
      name: "Closed Hi-Hat",
      sources: [{ type: "noise", noiseType: "white" }],
      envelope: { attack: 0.005, decay: 0.03, sustain: 0.0, release: 0.01 },
      filter: { type: "highpass", frequency: 8000, Q: 6 },
      duration: 0.05,
    },
    rawCommand: "raw noise:white env:0.01:0.03:0:0.01 dur:0.05 filter:highpass:8000:6",
  },
  {
    name: "Laser Blast",
    category: "Sound Effects",
    description: "Classic sci-fi laser sound with rapid downward pitch sweep.",
    blueprint: {
      id: "laser-blast",
      name: "Laser Blast",
      sources: [{ type: "oscillator", oscillatorType: "square", frequency: 1200 }],
      envelope: { attack: 0.01, decay: 0.15, sustain: 0.0, release: 0.01 },
      lfo: { type: "sine", frequency: 40, depth: 1000, target: "frequency" },
      duration: 0.16,
    },
    rawCommand: "raw osc:square:1200 env:0.01:0.15:0:0.01 dur:0.16 lfo:sine:40:-1000:frequency",
  },
  {
    name: "Church Organ",
    category: "Instruments",
    description: "Multi-octave organ voicing with rich harmonic reverberation.",
    blueprint: {
      id: "church-organ",
      name: "Church Organ",
      sources: [
        { type: "oscillator", oscillatorType: "sawtooth", frequency: 440 },
        { type: "oscillator", oscillatorType: "sawtooth", frequency: 880, detune: 5 },
        { type: "oscillator", oscillatorType: "sawtooth", frequency: 220, detune: -5 },
      ],
      envelope: { attack: 0.2, decay: 0.5, sustain: 0.7, release: 1.0 },
      effects: { reverb: { decay: 2.0, mix: 0.5 } },
      duration: 2.8,
    },
    rawCommand: "raw osc:sawtooth:440 dur:3 env:0.2:0.5:0.7:1 osc:sawtooth:880:5 osc:sawtooth:220:-5 reverb:2:0.5",
  },
  {
    name: "Crystal Pad",
    category: "Pads & Drones",
    description: "Bright shimmering pad with detuned triangle waves and stereo delay.",
    blueprint: {
      id: "crystal-pad",
      name: "Crystal Pad",
      sources: [
        { type: "oscillator", oscillatorType: "triangle", frequency: 880, detune: 7 },
        { type: "oscillator", oscillatorType: "triangle", frequency: 1320, detune: -7 },
      ],
      envelope: { attack: 1.2, decay: 1.0, sustain: 0.6, release: 1.8 },
      effects: {
        delay: { delayTime: 0.35, feedback: 0.4, mix: 0.4 },
        reverb: { decay: 3.0, mix: 0.5 },
      },
      duration: 4.0,
    },
    rawCommand: "raw osc:triangle:880:7 dur:5 env:1.5:1:0.6:2 osc:triangle:1320:-7 delay:0.5:0.4:0.4 reverb:3:0.5",
  },
];