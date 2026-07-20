/**
 * @file loopPattern.ts
 * @description The `loop` pattern language: vocabulary, parsing, validation.
 *
 * Deliberately free of any Tone.js or audio-engine import. Turning text into
 * steps is pure logic and is where the mistakes live, so it stays separable
 * from the graph that plays it — this module can be exercised without a Web
 * Audio context in sight.
 */

import { noteToFrequency } from './musicTheory'

// --- Vocabulary ----------------------------------------------------------

export const MELODIC_VOICES = ['bass', 'lead', 'pad', 'pluck'] as const
export type MelodicVoice = (typeof MELODIC_VOICES)[number]

export function isMelodicVoice(value: string): value is MelodicVoice {
  return (MELODIC_VOICES as readonly string[]).includes(value)
}

/** Pattern characters and the drum each one fires. */
export const DRUM_CHARS: Record<string, string> = {
  x: 'kick',
  o: 'snare',
  '-': 'hat',
  '*': 'openhat',
  c: 'clap',
  t: 'tom'
}

export const DRUM_LEGEND = 'x=kick  o=snare  -=hi-hat  *=open hat  c=clap  t=tom  .=rest'

export const SUBDIVISIONS = ['1n', '2n', '4n', '8n', '16n', '32n', '4t', '8t', '16t'] as const

export function isSubdivision(value: string): boolean {
  return (SUBDIVISIONS as readonly string[]).includes(value)
}

/**
 * One step of a loop: a drum character, frequencies to sound together, or
 * `null` for a rest. Tone skips nulls without invoking the callback.
 */
export type LoopStep = string | number[] | null

/** Guards against a typo'd pattern producing a thousand-step sequence. */
export const MAX_STEPS = 64
export const MAX_TRACKS = 12

const REST_TOKENS = new Set(['.', '_'])
/** A note token only counts as one if it carries an octave — `c` is a clap. */
const NOTE_WITH_OCTAVE = /^[A-Ga-g][#b]?-?\d+$/

// --- Parsing -------------------------------------------------------------

export interface ParsedPattern {
  kind: 'drum' | 'note'
  steps: LoopStep[]
  /** The pattern normalised for display, as `loop list` shows it. */
  pattern: string
  voice: MelodicVoice
  subdivision: string
  /** Steps that actually sound, i.e. excluding rests. */
  hits: number
}

export type PatternResult = { ok: true; value: ParsedPattern } | { ok: false; error: string }

interface PatternOptions {
  voice: MelodicVoice | null
  subdivision: string | null
  unknown: string[]
}

/** Pulls `@voice` / `@step` options out of the pattern, wherever they appear. */
function extractOptions(tokens: string[]): { tokens: string[]; options: PatternOptions } {
  const options: PatternOptions = { voice: null, subdivision: null, unknown: [] }
  const rest: string[] = []

  for (const token of tokens) {
    if (!token.startsWith('@')) {
      rest.push(token)
      continue
    }
    const value = token.slice(1).toLowerCase()
    if (isMelodicVoice(value)) options.voice = value
    else if (isSubdivision(value)) options.subdivision = value
    else options.unknown.push(token)
  }

  return { tokens: rest, options }
}

/** Splits a drum grid's characters into steps, collecting unknown symbols. */
function parseDrumSteps(tokens: string[]): { steps: LoopStep[]; bad: string[] } {
  const steps: LoopStep[] = []
  const bad: string[] = []

  for (const char of tokens.join('')) {
    if (REST_TOKENS.has(char)) steps.push(null)
    else if (DRUM_CHARS[char]) steps.push(char)
    else if (!bad.includes(char)) bad.push(char)
  }

  return { steps, bad }
}

/**
 * Turns note tokens into frequencies. `C4+E4+G4` sounds together as a chord,
 * which is what lets a single track carry a pad.
 */
function parseNoteSteps(tokens: string[]): { steps: LoopStep[]; bad: string[] } {
  const steps: LoopStep[] = []
  const bad: string[] = []

  for (const token of tokens) {
    if (REST_TOKENS.has(token)) {
      steps.push(null)
      continue
    }

    const frequencies: number[] = []
    let failed = false
    for (const part of token.split('+')) {
      const frequency = noteToFrequency(part)
      if (frequency == null) {
        failed = true
        break
      }
      frequencies.push(frequency)
    }

    if (failed || !frequencies.length) {
      if (!bad.includes(token)) bad.push(token)
      // Hold the slot so one bad token doesn't shift the rhythm forward.
      steps.push(null)
    } else {
      steps.push(frequencies)
    }
  }

  return { steps, bad }
}

/**
 * Parses the arguments after a track name into a playable pattern, or an
 * explanation of why it can't be played. Every rejection is phrased for the
 * terminal, since both the user and the AI read the same message.
 */
export function parsePattern(rawTokens: string[]): PatternResult {
  const { tokens, options } = extractOptions(rawTokens)

  if (options.unknown.length) {
    return {
      ok: false,
      error:
        `Unknown option(s): ${options.unknown.join(', ')}\n` +
        `  @voice: ${MELODIC_VOICES.join(', ')}\n  @step: ${SUBDIVISIONS.join(', ')}`
    }
  }
  if (!tokens.length) return { ok: false, error: 'No pattern given.' }

  // A melodic voice is an explicit request for a note track; otherwise an
  // octave-bearing token is the giveaway, since bare letters are drum chars.
  const kind: 'drum' | 'note' =
    options.voice || tokens.some((token) => NOTE_WITH_OCTAVE.test(token)) ? 'note' : 'drum'

  const { steps, bad } = kind === 'note' ? parseNoteSteps(tokens) : parseDrumSteps(tokens)

  if (bad.length) {
    const hint = kind === 'note' ? 'Notes look like C2, F#4, Bb3, or C4+E4+G4.' : DRUM_LEGEND
    return { ok: false, error: `Couldn't read: ${bad.join(' ')}\n  ${hint}` }
  }
  if (!steps.length) return { ok: false, error: `No steps in that pattern.\n  ${DRUM_LEGEND}` }
  if (steps.length > MAX_STEPS) {
    return { ok: false, error: `Pattern is ${steps.length} steps; the limit is ${MAX_STEPS}.` }
  }

  const hits = steps.filter((step) => step !== null).length
  if (!hits) return { ok: false, error: 'That pattern is silent — every step is a rest.' }

  return {
    ok: true,
    value: {
      kind,
      steps,
      pattern: tokens.join(kind === 'note' ? ' ' : ''),
      voice: options.voice ?? 'pluck',
      subdivision: options.subdivision ?? (kind === 'note' ? '8n' : '16n'),
      hits
    }
  }
}
