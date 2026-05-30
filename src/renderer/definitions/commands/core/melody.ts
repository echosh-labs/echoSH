import { CommandDefinition, CommandResult } from '../types'
import { audioEngine, SequenceEvent } from '@/renderer/lib/audio/audioEngine.ts'
import { noteToFrequency } from '@/renderer/lib/audio/musicTheory.ts'

/** A note within a built-in tune: a note name and a length in beats. */
type TuneNote = [note: string, beats: number]

/** A small library of recognisable tunes, as [note, beats] pairs. */
const TUNES: Record<string, TuneNote[]> = {
  twinkle: [
    ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
    ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2]
  ],
  ode: [
    ['E4', 1], ['E4', 1], ['F4', 1], ['G4', 1], ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1],
    ['C4', 1], ['C4', 1], ['D4', 1], ['E4', 1], ['E4', 1.5], ['D4', 0.5], ['D4', 2]
  ],
  scaleRun: [
    ['C4', 0.5], ['D4', 0.5], ['E4', 0.5], ['F4', 0.5],
    ['G4', 0.5], ['A4', 0.5], ['B4', 0.5], ['C5', 1]
  ],
  fanfare: [
    ['C4', 0.5], ['E4', 0.5], ['G4', 0.5], ['C5', 1], ['G4', 0.5], ['C5', 1.5]
  ]
}

export const melodyCommand: CommandDefinition = {
  name: 'melody',
  description: 'Plays a melody from notes ("melody C4 E4 G4") or a built-in tune ("melody twinkle").',
  execute: (args = []): CommandResult => {
    if (args.length === 0 || args[0] === 'list') {
      return { output: `Built-in tunes: ${Object.keys(TUNES).join(', ')}\n\nUsage: melody twinkle  |  melody C4 E4 G4 C5` }
    }

    const beat = 60 / audioEngine.getBpm()

    // Named tune?
    const tune = TUNES[args[0]] ?? TUNES[args[0].toLowerCase()]
    if (tune) {
      let time = 0
      const events: SequenceEvent[] = []
      for (const [note, beats] of tune) {
        const frequency = noteToFrequency(note)
        if (frequency != null) {
          events.push({ frequency, time, duration: beats * beat * 0.9 })
        }
        time += beats * beat
      }
      audioEngine.playSequence(events)
      return { output: `♫ Playing "${args[0]}" (${events.length} notes @ ${audioEngine.getBpm()} bpm)` }
    }

    // Otherwise treat every argument as an explicit note, one beat each.
    const events: SequenceEvent[] = []
    const invalid: string[] = []
    args.forEach((name, i) => {
      const frequency = noteToFrequency(name)
      if (frequency == null) invalid.push(name)
      else events.push({ frequency, time: i * beat, duration: beat * 0.9 })
    })

    if (events.length === 0) {
      return { output: `No playable notes found. Try 'melody C4 E4 G4' or 'melody list'.` }
    }

    audioEngine.playSequence(events)
    const warning = invalid.length ? `\n(skipped invalid: ${invalid.join(', ')})` : ''
    return { output: `♫ Playing ${events.length} notes @ ${audioEngine.getBpm()} bpm${warning}` }
  },
  argSet: [
    { literal: 'list', description: 'List the built-in tunes.' },
    {
      placeholder: 'notes...',
      description: 'A tune name (twinkle, ode, scaleRun, fanfare) or a list of notes (C4 E4 G4).',
      getSuggestions: (current: string) =>
        Object.keys(TUNES).filter((t) => t.toLowerCase().startsWith(current.toLowerCase()))
    }
  ]
}
