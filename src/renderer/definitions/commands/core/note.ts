import { CommandDefinition, CommandResult } from '../types'
import { defaultNoteBlueprint, noteToFrequency } from '@/renderer/lib/audio/musicTheory.ts'

export const noteCommand: CommandDefinition = {
  name: 'note',
  description: 'Plays a single musical note (e.g. "note C4", "note A#3").',
  execute: (args = []): CommandResult => {
    const name = args[0]
    if (!name) {
      return { output: 'Usage: note <name>  e.g. note C4, note A#3, note Bb5' }
    }

    const frequency = noteToFrequency(name)
    if (frequency == null) {
      return { output: `Invalid note: '${name}'. Try something like C4, A#3 or Bb5.` }
    }

    return {
      output: `♪ ${name} (${frequency.toFixed(2)} Hz)`,
      soundBlueprint: defaultNoteBlueprint(frequency)
    }
  },
  argSet: [
    {
      placeholder: 'name',
      description: 'A note in scientific pitch notation (C4, A#3, Bb5).'
    }
  ]
}
