/**
 * @file musicTheory.ts
 * @description Pure music-theory helpers shared by the musical commands
 * (note, chord, scale, melody, arp). No audio-engine dependencies — these
 * functions only turn note/chord/scale names into frequencies and produce
 * reusable sound blueprints.
 */

import { SoundBlueprint } from './audioBlueprints'

// Semitone offset of each pitch class from C, used for note-name parsing.
const NOTE_OFFSETS: Record<string, number> = {
  c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11
}

/**
 * Converts a scientific-pitch note name (e.g. "C4", "A#3", "Bb2") into a
 * frequency in Hz using 12-tone equal temperament with A4 = 440 Hz.
 * Returns null if the note cannot be parsed.
 */
export function noteToFrequency(note: string): number | null {
  // The octave is optional and defaults to 4 (so "C" === "C4").
  const match = /^([a-gA-G])([#b]?)(-?\d+)?$/.exec(note.trim())
  if (!match) return null

  const [, letter, accidental, octaveStr] = match
  let semitone = NOTE_OFFSETS[letter.toLowerCase()]
  if (accidental === '#') semitone += 1
  else if (accidental === 'b') semitone -= 1

  const octave = octaveStr !== undefined ? parseInt(octaveStr, 10) : 4
  // MIDI note number, then convert to frequency. A4 (MIDI 69) = 440 Hz.
  const midi = semitone + (octave + 1) * 12
  return 440 * Math.pow(2, (midi - 69) / 12)
}

/**
 * Chord types expressed as semitone intervals above the root. Includes common
 * shorthand aliases (e.g. "m" and "minor" for "min") so tokens like "Am" parse.
 */
export const CHORDS: Record<string, number[]> = {
  maj: [0, 4, 7],
  major: [0, 4, 7],
  '': [0, 4, 7],
  min: [0, 3, 7],
  m: [0, 3, 7],
  minor: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  m7: [0, 3, 7, 10],
  '7': [0, 4, 7, 10], // dominant 7th
  dom7: [0, 4, 7, 10],
  maj9: [0, 4, 7, 11, 14],
  min9: [0, 3, 7, 10, 14],
  '6': [0, 4, 7, 9],
  min6: [0, 3, 7, 9],
  m6: [0, 3, 7, 9]
}

/** Scale types expressed as ascending semitone steps from the root (one octave). */
export const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  minor: [0, 2, 3, 5, 7, 8, 10, 12],
  harmonicminor: [0, 2, 3, 5, 7, 8, 11, 12],
  pentatonic: [0, 2, 4, 7, 9, 12],
  minorpentatonic: [0, 3, 5, 7, 10, 12],
  blues: [0, 3, 5, 6, 7, 10, 12],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],
  mixolydian: [0, 2, 4, 5, 7, 9, 10, 12],
  lydian: [0, 2, 4, 6, 7, 9, 11, 12],
  phrygian: [0, 1, 3, 5, 7, 8, 10, 12],
  wholetone: [0, 2, 4, 6, 8, 10, 12]
}

/** Shifts a base frequency by a number of semitones. */
export function transpose(frequency: number, semitones: number): number {
  return frequency * Math.pow(2, semitones / 12)
}

/**
 * Splits a combined chord token like "Cmaj7" or "A#min" into its root note
 * (defaulting to octave 4) and chord-type key. Also accepts a pre-split form
 * where the caller passes the root and type separately.
 */
export function parseChordToken(token: string, explicitType?: string): { root: string; type: string } | null {
  const match = /^([a-gA-G][#b]?)(\d?)(.*)$/.exec(token.trim())
  if (!match) return null
  const [, letter, octave, rest] = match
  const root = `${letter}${octave || '4'}`
  const type = (explicitType ?? rest ?? '').toLowerCase() || 'maj'
  return { root, type }
}

/** Returns the frequencies of a chord, or null if the note/type is unknown. */
export function chordFrequencies(rootNote: string, type: string): number[] | null {
  const rootFreq = noteToFrequency(rootNote)
  const intervals = CHORDS[type.toLowerCase()]
  if (rootFreq == null || !intervals) return null
  return intervals.map((semis) => transpose(rootFreq, semis))
}

/** Returns the frequencies of an ascending scale, or null if unknown. */
export function scaleFrequencies(rootNote: string, type: string, octaves = 1): number[] | null {
  const rootFreq = noteToFrequency(rootNote)
  const steps = SCALES[type.toLowerCase()]
  if (rootFreq == null || !steps) return null

  const freqs: number[] = []
  for (let o = 0; o < octaves; o++) {
    // Skip the repeated octave root on all but the final octave.
    const stepsForOctave = o < octaves - 1 ? steps.slice(0, -1) : steps
    for (const semis of stepsForOctave) {
      freqs.push(transpose(rootFreq, semis + o * 12))
    }
  }
  return freqs
}

/**
 * Builds a pleasant, reusable sound blueprint for a single pitched note.
 * Shared by the musical commands so they all sound consistent.
 */
export function defaultNoteBlueprint(frequency: number, duration = 0.6): SoundBlueprint {
  return {
    sources: [
      { type: 'oscillator', oscillatorType: 'triangle', frequency },
      { type: 'oscillator', oscillatorType: 'sine', frequency, detune: 5 }
    ],
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.4, release: 0.3 },
    filter: { type: 'biquad', filterType: 'lowpass', frequency: 3000, Q: 0.8 },
    duration
  }
}
