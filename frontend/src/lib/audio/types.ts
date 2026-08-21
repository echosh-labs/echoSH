export type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";
export type NoiseType = "white" | "pink" | "brown";

export interface OscillatorVoice {
  type: "oscillator";
  oscillatorType: OscillatorType;
  frequency: number; // Base frequency in Hz
  detune?: number; // Detune in cents
  volumeDb?: number;
}

export interface NoiseVoice {
  type: "noise";
  noiseType: NoiseType;
  volumeDb?: number;
}

export type SoundSource = OscillatorVoice | NoiseVoice;

export interface EnvelopeConfig {
  attack: number; // seconds
  decay: number; // seconds
  sustain: number; // 0.0 - 1.0
  release: number; // seconds
}

export interface BiquadFilterConfig {
  type: "lowpass" | "highpass" | "bandpass" | "notch" | "peaking";
  frequency: number; // Hz
  Q: number; // Resonance
  gain?: number; // dB
}

export interface ModulationConfig {
  type: OscillatorType;
  frequency: number; // Hz
  depth: number; // Frequency sweep range in Hz
  target: "frequency" | "filterCutoff" | "pan";
}

export interface EffectsConfig {
  delay?: {
    delayTime: number; // seconds
    feedback: number; // 0.0 - 1.0
    mix: number; // 0.0 - 1.0
  };
  reverb?: {
    decay: number; // seconds
    mix: number; // 0.0 - 1.0
  };
  distortion?: {
    amount: number;
  };
  panner?: {
    pan: number; // -1.0 to 1.0
  };
}

export interface SoundBlueprint {
  id?: string;
  name?: string;
  sources: SoundSource[];
  envelope: EnvelopeConfig;
  filter?: BiquadFilterConfig;
  lfo?: ModulationConfig;
  effects?: EffectsConfig;
  duration: number; // seconds
}

export interface AudioPreset {
  name: string;
  category: "Planetary & Esoteric" | "Percussion" | "Sound Effects" | "Instruments" | "Pads & Drones";
  description: string;
  blueprint: SoundBlueprint;
  rawCommand?: string;
}