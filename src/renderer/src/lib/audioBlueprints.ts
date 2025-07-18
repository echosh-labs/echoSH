// src/renderer/src/lib/audioBlueprints.ts

/**
 * @file audioBlueprints.ts
 * @description Defines the data structures for generative sound synthesis.
 */

export interface EnvelopeBlueprint {
  attack: number // Time to reach peak volume
  decay: number // Time to sustain level
  sustain: number // Sustain volume level (0 to 1)
  release: number // Time to fade out from sustain level
}

export interface OscillatorBlueprint {
  type: OscillatorType // 'sine', 'square', 'sawtooth', 'triangle'
  frequency: number // Base frequency in Hz
  detune?: number // Detune in cents
}

export interface LfoBlueprint {
  type: OscillatorType
  frequency: number // LFO rate in Hz
  affects: 'frequency' | 'amplitude' // What the LFO modulates
  depth: number // How much the LFO modulates the target
}

export interface SoundBlueprint {
  oscillators: OscillatorBlueprint[]
  envelope: EnvelopeBlueprint
  lfo?: LfoBlueprint // Optional LFO
  duration: number // Total duration of the sound in seconds
}