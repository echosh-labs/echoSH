/**
 * @file src/renderer/lib/audio/sidechain.ts
 * @description Sonifies Claude's streaming response — a note per group of
 * characters, played underneath the text as it arrives.
 *
 * The mapping is deterministic, not random: the same response always produces
 * the same melody. Each group of characters is hashed to a fixed index in a
 * pentatonic pool, so the result tracks the actual content (repeated words
 * repeat their motif) while staying consonant no matter what Claude writes.
 */

import { audioEngine } from '@/renderer/lib/audio/audioEngine.ts'
import { scaleFrequencies } from '@/renderer/lib/audio/musicTheory.ts'

/** Characters per note. Small enough to feel reactive, large enough to breathe. */
const GROUP_SIZE = 4

/** Note spacing as a fraction of a beat — a 16th note. */
const NOTE_SPACING_BEATS = 0.25

/**
 * Groups containing sentence-ending punctuation or a line break get an extra
 * gap after them. On sampled prose this fires on roughly one group in ten,
 * which is about one breath per sentence.
 */
const PHRASE_BREAK = /[.!?\n]/

/**
 * How far ahead of the audio clock we're willing to schedule. Claude can stream
 * faster than the note rate; without a ceiling the backlog would grow and notes
 * would still be playing long after the text finished. Past this we drop groups
 * instead of queueing them, keeping sound aligned with the visible text.
 */
const MAX_SCHEDULE_AHEAD = 0.4

/**
 * Minor pentatonic over three octaves — every note lands consonantly against
 * every other, so an arbitrary text-driven walk can't produce a wrong note.
 * Built once; falls back to an empty pool if the note names ever fail to parse.
 */
const POOL: number[] = scaleFrequencies('C3', 'minorpentatonic', 3) ?? []

let enabled = true

export function isSidechainEnabled(): boolean {
  return enabled
}

export function setSidechainEnabled(on: boolean): void {
  enabled = on
}

/**
 * FNV-1a over the group's characters. Any deterministic hash works; this one is
 * cheap and avalanches well, so "the" and "teh" land on different degrees
 * instead of colliding the way a plain char-code sum would.
 */
function hashGroup(group: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < group.length; i++) {
    hash ^= group.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export interface Sidechain {
  /** Feed the full response so far; only the new tail is sonified. */
  feed(fullText: string): void
  /** Stop scheduling. Notes already scheduled still play out. */
  stop(): void
}

/**
 * `answer` uses the whole pentatonic range at sixteenths. `thinking` is
 * confined to the bottom octave and spaced at eighths, so reasoning reads as a
 * slow low murmur and you can hear the moment it starts writing.
 */
export type SidechainVoice = 'answer' | 'thinking'

interface VoiceConfig {
  /** Slice of POOL this voice may use. */
  range: [number, number]
  spacing: number
}

const VOICES: Record<SidechainVoice, VoiceConfig> = {
  answer: { range: [0, 1], spacing: NOTE_SPACING_BEATS },
  thinking: { range: [0, 1 / 3], spacing: NOTE_SPACING_BEATS * 2 }
}

/**
 * Creates a sonifier for one response. State is per-request so two overlapping
 * responses can't share a scheduling cursor.
 */
export function createSidechain(voice: SidechainVoice = 'answer'): Sidechain {
  const config = VOICES[voice]
  // Precomputed so `emit` isn't re-slicing the pool on every note.
  const notes = POOL.slice(
    Math.floor(POOL.length * config.range[0]),
    Math.max(1, Math.floor(POOL.length * config.range[1]))
  )
  /** How much of the response we've already turned into notes. */
  let consumed = 0
  /** Leftover characters from the last chunk that didn't fill a group. */
  let pending = ''
  /** Audio-clock time for the next note. */
  let cursor = 0
  let stopped = false

  function emit(group: string): void {
    const beat = 60 / audioEngine.getBpm()

    // An all-whitespace group rests. This is uncommon in prose (it takes four
    // consecutive spaces, e.g. an indented code block) — sentence phrasing is
    // handled by the punctuation gap below, not by this.
    if (group.trim()) {
      audioEngine.playSidechainNote(notes[hashGroup(group) % notes.length], cursor)
    }

    cursor += config.spacing * beat

    // Breathe at sentence and line boundaries, so the sonification phrases with
    // the prose instead of running as one unbroken sixteenth-note stream.
    if (PHRASE_BREAK.test(group)) cursor += config.spacing * beat
  }

  return {
    feed(fullText: string): void {
      if (stopped || !enabled || !notes.length) return

      // Main re-sends the full text each chunk, so the delta is the new tail.
      // A shorter string means this is a fresh snapshot, not a continuation —
      // reasoning restarts after each tool call. Rewind so the new thought is
      // sonified from its start rather than staying silent until it outgrows
      // the previous one. Slicing without this would go negative.
      if (fullText.length < consumed) {
        consumed = 0
        pending = ''
      }

      const delta = fullText.slice(consumed)
      consumed = fullText.length
      if (!delta) return

      const now = audioEngine.now()
      // Restart the cursor if it's behind the clock — either this is the first
      // chunk or the stream paused long enough for the schedule to drain.
      if (cursor < now) cursor = now

      pending += delta
      while (pending.length >= GROUP_SIZE) {
        if (cursor - now > MAX_SCHEDULE_AHEAD) {
          // Too far ahead: drop the backlog rather than trailing the text.
          pending = ''
          break
        }
        emit(pending.slice(0, GROUP_SIZE))
        pending = pending.slice(GROUP_SIZE)
      }
    },

    stop(): void {
      stopped = true
      pending = ''
    }
  }
}
