import { AudioPreset, SoundBlueprint } from "./types";

// ==========================================
// 1. PLANETARY & CELESTIAL BLUEPRINTS
// ==========================================

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

export const sunSolarCarrier: SoundBlueprint = {
  id: "sun-solar-carrier",
  name: "Sun Solar Ray (126.22 Hz)",
  sources: [
    { type: "oscillator", oscillatorType: "sawtooth", frequency: 126.22 },
    { type: "oscillator", oscillatorType: "sine", frequency: 252.44, detune: 6 },
  ],
  envelope: { attack: 0.4, decay: 1.2, sustain: 0.5, release: 1.8 },
  filter: { type: "lowpass", frequency: 1200, Q: 3 },
  effects: { reverb: { decay: 3.0, mix: 0.4 } },
  duration: 3.5,
};

export const moonSynodicResonator: SoundBlueprint = {
  id: "moon-synodic-resonator",
  name: "Moon Synodic Tide (210.42 Hz)",
  sources: [
    { type: "oscillator", oscillatorType: "sine", frequency: 210.42 },
    { type: "oscillator", oscillatorType: "triangle", frequency: 420.84, detune: -8 },
  ],
  envelope: { attack: 0.6, decay: 1.5, sustain: 0.4, release: 2.2 },
  filter: { type: "lowpass", frequency: 900, Q: 2 },
  effects: { reverb: { decay: 3.5, mix: 0.5 } },
  duration: 4.0,
};

export const venusAmorHarmonic: SoundBlueprint = {
  id: "venus-amor-harmonic",
  name: "Venus Harmonic Beauty (221.23 Hz)",
  sources: [
    { type: "oscillator", oscillatorType: "triangle", frequency: 221.23 },
    { type: "oscillator", oscillatorType: "sine", frequency: 442.46, detune: 4 },
    { type: "oscillator", oscillatorType: "sine", frequency: 663.69, detune: -4 },
  ],
  envelope: { attack: 0.2, decay: 0.9, sustain: 0.35, release: 1.5 },
  filter: { type: "lowpass", frequency: 2200, Q: 2 },
  effects: { reverb: { decay: 2.8, mix: 0.45 } },
  duration: 2.8,
};

export const jupiterWisdomChime: SoundBlueprint = {
  id: "jupiter-wisdom-chime",
  name: "Jupiter Guru Synthesis (183.58 Hz)",
  sources: [
    { type: "oscillator", oscillatorType: "sine", frequency: 183.58 },
    { type: "oscillator", oscillatorType: "triangle", frequency: 367.16, detune: 7 },
    { type: "oscillator", oscillatorType: "sine", frequency: 734.32, detune: -5 },
  ],
  envelope: { attack: 0.05, decay: 1.0, sustain: 0.3, release: 1.8 },
  filter: { type: "lowpass", frequency: 2500, Q: 3 },
  effects: { reverb: { decay: 3.2, mix: 0.5 } },
  duration: 3.0,
};

export const saturnDisciplineDrone: SoundBlueprint = {
  id: "saturn-discipline-drone",
  name: "Saturn Shani Pillar (147.85 Hz)",
  sources: [
    { type: "oscillator", oscillatorType: "sawtooth", frequency: 147.85 },
    { type: "oscillator", oscillatorType: "sine", frequency: 73.92, detune: -5 },
  ],
  envelope: { attack: 0.8, decay: 1.5, sustain: 0.6, release: 2.5 },
  filter: { type: "lowpass", frequency: 550, Q: 4 },
  effects: { reverb: { decay: 4.0, mix: 0.6 } },
  duration: 4.5,
};

// ==========================================
// 2. FOUNDATIONS & HERMETIC BLUEPRINTS
// ==========================================

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
  effects: { reverb: { decay: 3.5, mix: 0.5 } },
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
  effects: {
    reverb: { decay: 4.0, mix: 0.6 },
    delay: { delayTime: 0.4, feedback: 0.5, mix: 0.35 },
  },
  duration: 4.5,
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
  filter: { type: "lowpass", frequency: 2500, Q: 2 },
  duration: 0.48,
};

// ==========================================
// 3. FM SYNTHESIS LAB BLUEPRINTS
// ==========================================

export const fmCyberRhodes: SoundBlueprint = {
  id: "fm-cyber-rhodes",
  name: "FM Cyber Rhodes",
  sources: [
    {
      type: "fm",
      carrierType: "sine",
      carrierFrequency: 440,
      modulatorType: "sine",
      modRatio: 1.0,
      modIndex: 320,
      modEnvelope: { attack: 0.005, decay: 0.6, sustain: 0.1, release: 0.8 },
    },
  ],
  envelope: { attack: 0.005, decay: 0.8, sustain: 0.2, release: 1.2 },
  effects: { reverb: { decay: 2.2, mix: 0.35 } },
  duration: 2.0,
};

export const fmMetallicSpaceBell: SoundBlueprint = {
  id: "fm-space-bell",
  name: "FM Metallic Space Bell",
  sources: [
    {
      type: "fm",
      carrierType: "sine",
      carrierFrequency: 880,
      modulatorType: "sine",
      modRatio: 3.5,
      modIndex: 900,
      modEnvelope: { attack: 0.002, decay: 0.7, sustain: 0.05, release: 1.0 },
    },
  ],
  envelope: { attack: 0.002, decay: 0.9, sustain: 0.1, release: 1.5 },
  effects: {
    delay: { delayTime: 0.28, feedback: 0.4, mix: 0.3 },
    reverb: { decay: 3.0, mix: 0.5 },
  },
  duration: 2.5,
};

export const fmLaserSweep: SoundBlueprint = {
  id: "fm-laser-sweep",
  name: "FM Quicksilver Laser Sweep",
  sources: [
    {
      type: "fm",
      carrierType: "sawtooth",
      carrierFrequency: 1400,
      modulatorType: "square",
      modRatio: 0.5,
      modIndex: 1500,
      modEnvelope: { attack: 0.005, decay: 0.12, sustain: 0.0, release: 0.05 },
    },
  ],
  envelope: { attack: 0.005, decay: 0.18, sustain: 0.0, release: 0.05 },
  filter: { type: "lowpass", frequency: 4000, Q: 3 },
  duration: 0.25,
};

// ==========================================
// 4. PHYSICAL MODELING & PLUCKS
// ==========================================

export const physicalCyberHarp: SoundBlueprint = {
  id: "physical-cyber-harp",
  name: "Physical Cyber Harp (C5)",
  sources: [
    {
      type: "pluck",
      frequency: 523.25,
      damping: 0.04,
      brightness: 5.0,
    },
  ],
  envelope: { attack: 0.001, decay: 1.2, sustain: 0.1, release: 0.8 },
  effects: { reverb: { decay: 2.5, mix: 0.4 } },
  duration: 2.2,
};

export const physicalSitarPluck: SoundBlueprint = {
  id: "physical-sitar-pluck",
  name: "Physical Sitar Resonator (D4)",
  sources: [
    {
      type: "pluck",
      frequency: 293.66,
      damping: 0.02,
      brightness: 8.0,
    },
  ],
  envelope: { attack: 0.001, decay: 1.5, sustain: 0.15, release: 1.0 },
  effects: {
    delay: { delayTime: 0.2, feedback: 0.35, mix: 0.25 },
    reverb: { decay: 2.8, mix: 0.4 },
  },
  duration: 2.6,
};

// ==========================================
// 5. PERCUSSION & COSMIC FX
// ==========================================

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
  duration: 0.23,
};

// ==========================================
// MASTER REGISTRY OF ALL PRESETS
// ==========================================

export const audioPresets: AudioPreset[] = [
  // Planetary & Cosmic
  {
    name: "Mercury Orbital Bell (141.27 Hz)",
    category: "Planetary & Cosmic",
    description: "Tuned to the cosmic frequency of Mercury's planetary rotation and Buddhi discernment.",
    blueprint: mercuryFundamentalBell,
  },
  {
    name: "Sun Solar Ray (126.22 Hz)",
    category: "Planetary & Cosmic",
    description: "Tuned to the astronomical frequency of the Sun and radiant Solar awareness.",
    blueprint: sunSolarCarrier,
  },
  {
    name: "Moon Synodic Tide (210.42 Hz)",
    category: "Planetary & Cosmic",
    description: "Tuned to the synodic lunar cycle and intuitive psychic currents.",
    blueprint: moonSynodicResonator,
  },
  {
    name: "Venus Harmonic Beauty (221.23 Hz)",
    category: "Planetary & Cosmic",
    description: "Tuned to the planetary rotation of Venus, governing aesthetic grace and synthesis.",
    blueprint: venusAmorHarmonic,
  },
  {
    name: "Jupiter Guru Synthesis (183.58 Hz)",
    category: "Planetary & Cosmic",
    description: "Tuned to Jupiter's orbital frequency, embodying expansive wisdom and philosophical integration.",
    blueprint: jupiterWisdomChime,
  },
  {
    name: "Saturn Shani Pillar (147.85 Hz)",
    category: "Planetary & Cosmic",
    description: "Tuned to Saturn's orbital period, grounding structural endurance and discipline.",
    blueprint: saturnDisciplineDrone,
  },

  // Foundations & Hermetic
  {
    name: "Intuition (432 Hz Violet Drone)",
    category: "Foundations & Hermetic",
    description: "Foundations Stage 1: The inner staircase of subtle guidance and psychic awakening.",
    blueprint: intuitionVioletDrone,
  },
  {
    name: "Idealism (528 Hz Solfeggio Ascent)",
    category: "Foundations & Hermetic",
    description: "Foundations Stage 2: The ascent of architectural will and philosophical aspiration.",
    blueprint: idealismCyanArpeggio,
  },
  {
    name: "Tria Prima Quicksilver Drone",
    category: "Foundations & Hermetic",
    description: "Deep alchemical drone reconciling Spiritus, Sulfur, and Salt with resonant sweeps.",
    blueprint: alchemicalTransmutationDrone,
  },
  {
    name: "Rainbow Flutter Synesthesia",
    category: "Foundations & Hermetic",
    description: "Tri-oscillator shimmering chord with vibrato and spatial dispersion.",
    blueprint: rainbowFlutter,
  },

  // FM Synthesis Lab
  {
    name: "FM Cyber Rhodes",
    category: "FM Synthesis Lab",
    description: "2-Operator frequency modulated electric chime with crystal overtones.",
    blueprint: fmCyberRhodes,
  },
  {
    name: "FM Metallic Space Bell",
    category: "FM Synthesis Lab",
    description: "High-index FM metallic bell with stereo ping-pong delay and cosmic reverb.",
    blueprint: fmMetallicSpaceBell,
  },
  {
    name: "FM Quicksilver Laser Sweep",
    category: "FM Synthesis Lab",
    description: "Rapid downward frequency modulated transient sweep.",
    blueprint: fmLaserSweep,
  },

  // Physical Plucks & Harps
  {
    name: "Physical Cyber Harp (C5)",
    category: "Physical Plucks & Harps",
    description: "Karplus-Strong algorithmic plucked acoustic string with algorithmic room reverb.",
    blueprint: physicalCyberHarp,
  },
  {
    name: "Physical Sitar Resonator (D4)",
    category: "Physical Plucks & Harps",
    description: "Physical modeling string with bright harmonic buzz and tape delay.",
    blueprint: physicalSitarPluck,
  },

  // Percussion & FX
  {
    name: "808 Sub Kick",
    category: "Percussion & FX",
    description: "Punchy sub-bass kick with rapid pitch descent and warm lowpass filtering.",
    blueprint: {
      id: "808-kick",
      name: "808 Sub Kick",
      sources: [{ type: "oscillator", oscillatorType: "sine", frequency: 150 }],
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.0, release: 0.05 },
      filter: { type: "lowpass", frequency: 500, Q: 1.5 },
      duration: 0.35,
    },
  },
  {
    name: "Snare Snap",
    category: "Percussion & FX",
    description: "White noise snap blended with a resonant sine body.",
    blueprint: {
      id: "snare-snap",
      name: "Snare Snap",
      sources: [
        { type: "noise", noiseType: "white" },
        { type: "oscillator", oscillatorType: "sine", frequency: 200 },
      ],
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.0, release: 0.05 },
      filter: { type: "bandpass", frequency: 1500, Q: 5 },
      duration: 0.16,
    },
  },
  {
    name: "Closed Hi-Hat",
    category: "Percussion & FX",
    description: "Crisp, metallic hi-hat using highpass filtered white noise.",
    blueprint: {
      id: "closed-hi-hat",
      name: "Closed Hi-Hat",
      sources: [{ type: "noise", noiseType: "white" }],
      envelope: { attack: 0.005, decay: 0.03, sustain: 0.0, release: 0.01 },
      filter: { type: "highpass", frequency: 8000, Q: 6 },
      duration: 0.05,
    },
  },
];