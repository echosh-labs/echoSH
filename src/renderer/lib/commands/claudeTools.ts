/**
 * @file src/renderer/lib/commands/claudeTools.ts
 * @description Executes Claude's tool calls against the renderer's audio engine.
 *
 * Claude's conversation loop runs in the main process, but its tools have to run
 * here — the synthesiser and its Web Audio context live in the renderer. Main
 * dispatches a tool call over IPC and blocks the turn until we answer, so every
 * path through this file must produce a result.
 */

import { audioEngine, SequenceEvent } from '@/renderer/lib/audio/audioEngine.ts'
import { noteToFrequency } from '@/renderer/lib/audio/musicTheory.ts'
import type CommandProcessor from '@/renderer/lib/commands/commandProcessor.ts'
import {
  ClaudeToolCall,
  MelodyNote,
  PlayMelodyInput,
  RunCommandInput
} from '@/renderer/types/claude.ts'

export interface ToolOutcome {
  content: string
  isError?: boolean
  /** Shown in the terminal so the user sees what Claude just did. */
  transcript?: string
}

/** Refuse absurd inputs rather than locking up the audio graph. */
const MAX_NOTES = 128

function isMelodyNote(value: unknown): value is MelodyNote {
  if (typeof value !== 'object' || value === null) return false
  const note = value as Partial<MelodyNote>
  return typeof note.note === 'string' && typeof note.beats === 'number'
}

function playMelody(input: PlayMelodyInput): ToolOutcome {
  const notes = Array.isArray(input?.notes) ? input.notes.filter(isMelodyNote) : []

  if (!notes.length) {
    return {
      content: 'No valid notes supplied. Each note needs a name like "C4" and a beat length.',
      isError: true
    }
  }
  if (notes.length > MAX_NOTES) {
    return { content: `Too many notes (${notes.length}); the limit is ${MAX_NOTES}.`, isError: true }
  }

  // A per-melody bpm override affects note spacing only — it deliberately does
  // not change the app's global tempo, which the user controls via `tempo`.
  const bpm = typeof input.bpm === 'number' && input.bpm > 0 ? input.bpm : audioEngine.getBpm()
  const beat = 60 / bpm

  const events: SequenceEvent[] = []
  const skipped: string[] = []
  let time = 0

  for (const { note, beats } of notes) {
    const frequency = noteToFrequency(note)
    // Guard the duration too: a non-positive or absent length would stack every
    // remaining note onto the same instant.
    const length = Number.isFinite(beats) && beats > 0 ? beats : 1

    if (frequency == null) {
      skipped.push(note)
    } else {
      // The 0.9 gap keeps repeated notes articulate instead of slurring.
      events.push({ frequency, time, duration: length * beat * 0.9 })
      time += length * beat
    }
  }

  if (!events.length) {
    return { content: `None of those notes could be parsed: ${skipped.join(', ')}`, isError: true }
  }

  audioEngine.playSequence(events)

  const title = typeof input.title === 'string' && input.title.trim() ? input.title.trim() : null
  const seconds = time.toFixed(1)
  const warning = skipped.length ? ` (skipped: ${skipped.join(', ')})` : ''

  return {
    content: `Played ${events.length} notes over ${seconds}s at ${bpm} bpm.${warning}`,
    transcript: `♫ ${title ?? 'Playing'} — ${events.length} notes @ ${bpm} bpm${warning}`
  }
}

/** Longest command output we hand back to Claude, in characters. */
const MAX_TOOL_OUTPUT = 4000

function runCommand(input: RunCommandInput, processor: CommandProcessor): ToolOutcome {
  const command = typeof input?.command === 'string' ? input.command.trim() : ''
  if (!command) {
    return { content: 'No command supplied.', isError: true }
  }

  const result = processor.runForTool(command)
  const output = typeof result.output === 'string' ? result.output : ''

  return {
    content:
      (output.length > MAX_TOOL_OUTPUT
        ? `${output.slice(0, MAX_TOOL_OUTPUT)}\n...[truncated]`
        : output) || '(no output)',
    // Echo it the way the terminal would have, so the user can see exactly what
    // Claude ran rather than only its description of what it ran.
    transcript: output ? `$ ${command}\n${output}` : `$ ${command}`
  }
}

/**
 * Routes one tool call. Unknown names come back as an error result rather than
 * a throw, so Claude can recover on the next iteration.
 */
export function runClaudeTool(call: ClaudeToolCall, processor: CommandProcessor): ToolOutcome {
  switch (call.name) {
    case 'play_melody':
      return playMelody(call.input as PlayMelodyInput)
    case 'run_command':
      return runCommand(call.input as RunCommandInput, processor)
    default:
      return { content: `Unknown tool: ${call.name}`, isError: true }
  }
}
