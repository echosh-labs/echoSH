/**
 * @file audioBlueprints.ts
 * @description Defines the data structures for generative sound synthesis using the Web Audio API.
 */

// --- Core Sound Generation ---

export type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

export interface OscillatorBlueprint {
  type: "oscillator";
  oscillatorType: OscillatorType;
  frequency: number; // Base frequency in Hz
  detune?: number; // Detune in cents
}

export type NoiseType = "white" | "pink" | "brown";
export interface NoiseBlueprint {
  type: "noise";
  noiseType: NoiseType;
}

/**
 * A union type representing any possible sound source.
 */
export type SoundSourceBlueprint = OscillatorBlueprint | NoiseBlueprint;

// --- Modulation ---

export interface EnvelopeBlueprint {
  attack: number; // Time in seconds to reach peak volume
  decay: number; // Time in seconds to fall to the sustain level
  sustain: number; // Sustain volume level (0.0 to 1.0)
  release: number; // Time in seconds to fade out from sustain level
}

/**
 * A structured object describing what an LFO (Low-Frequency Oscillator) modulates.
 * This provides a type-safe and extensible way to define modulation targets.
 */
export type LfoAffects =
  | { target: "source"; param: "frequency" } // Modulates the frequency of all source oscillators
  | { target: "filter"; param: "frequency" | "Q" }; // Modulates the filter's cutoff or Q
// Future targets like 'panner', 'delay', etc., can be added here.

export interface LfoBlueprint {
  type: OscillatorType;
  frequency: number; // LFO rate in Hz
  affects: LfoAffects; // A structured object defining the modulation target
  depth: number; // How much the LFO modulates the target parameter
}

// --- Timbre and Tone Shaping ---

export type BiquadFilterType =
  | "lowpass"
  | "highpass"
  | "bandpass"
  | "peaking"
  | "lowshelf"
  | "highshelf"
  | "notch"
  | "allpass";
export interface BiquadFilterBlueprint {
  type: "biquad";
  filterType: BiquadFilterType;
  frequency: number; // The cutoff or center frequency in Hz
  Q: number; // The Quality factor, also known as resonance or bandwidth
  gain?: number; // Required for 'lowshelf', 'highshelf', and 'peaking' filters (in dB)
}

/**
 * Represents a custom IIR (Infinite Impulse Response) filter,
 * allowing for the creation of custom filters via coefficients.
 */
export interface IIRFilterBlueprint {
  type: "iir";
  feedforward: number[];
  feedback: number[];
}

/**
 * A union type representing any filterable node.
 */
export type FilterBlueprint = BiquadFilterBlueprint | IIRFilterBlueprint;

// --- Effects ---

export interface DelayBlueprint {
  delayTime: number; // Delay time in seconds
  feedback: number; // Amount of output fed back into the input (0.0 to 1.0)
  mix?: number; // Wet/dry mix of the effect (0.0 to 1.0)
}

export type OverSampleType = "none" | "2x" | "4x";

export interface DistortionBlueprint {
  amount: number; // A value controlling the intensity of the distortion curve
  oversample: OverSampleType;
}

export interface ReverbBlueprint {
  /**
   * The duration of the reverb tail in seconds.
   */
  decay: number;
  /**
   * If true, the reverb tail will build up instead of fading out.
   */
  reverse?: boolean;
  mix?: number; // Wet/dry mix of the effect (0.0 to 1.0)
}

// --- Spatialization and Dynamics ---

/**
 * Represents a simple stereo panner node for left-right panning.
 */
export interface StereoPannerBlueprint {
  type: "stereo";
  pan: number; // Stereo pan position, from -1 (hard left) to 1 (hard right)
}

/**
 * Represents a 3D positional panner node for immersive audio.
 */
export interface PositionalPannerBlueprint {
  type: "positional";
  panningModel?: "equalpower" | "HRTF";
  distanceModel?: "linear" | "inverse" | "exponential";
  position?: [number, number, number]; // [x, y, z]
  orientation?: [number, number, number]; // [x, y, z]
  refDistance?: number;
  maxDistance?: number;
  rolloffFactor?: number;
  coneInnerAngle?: number;
  coneOuterAngle?: number;
  coneOuterGain?: number;
}

/**
 * A union type representing any available panner node.
 */
export type PannerBlueprint = StereoPannerBlueprint | PositionalPannerBlueprint;

/**
 * Represents the global listener settings for 3D audio.
 * This should be configured once on the AudioContext, not per-sound.
 */
export interface AudioListenerBlueprint {
  position?: [number, number, number];
  forward?: [number, number, number];
  up?: [number, number, number];
}

export interface CompressorBlueprint {
  threshold: number; // dB level above which compression starts (-100 to 0)
  knee: number; // Range (in dB) above the threshold where the curve smoothly transitions (0 to 40)
  ratio: number; // The amount of gain reduction (1 to 20)
  attack: number; // Time in seconds to reduce the gain
  release: number; // Time in seconds to increase the gain
}

// --- Master Sound Blueprint ---

/**
 * Represents the complete definition of a sound, combining all possible modules.
 */
export interface SoundBlueprint {
  sources: SoundSourceBlueprint[]; // An array of sound sources (oscillators, noise)
  envelope: EnvelopeBlueprint;
  filter?: FilterBlueprint;
  lfo?: LfoBlueprint;
  delay?: DelayBlueprint;
  distortion?: DistortionBlueprint;
  reverb?: ReverbBlueprint;
  panner?: PannerBlueprint;
  compressor?: CompressorBlueprint;
  duration: number; // Total duration of the sound in seconds
}
