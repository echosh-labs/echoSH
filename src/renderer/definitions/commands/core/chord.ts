import { CommandDefinition, CommandResult } from '../types'
import { SoundBlueprint } from '@/renderer/lib/audio/audioBlueprints.ts'
import { CHORDS, chordFrequencies, parseChordToken } from '@/renderer/lib/audio/musicTheory.ts'

/** Builds a single blueprint that sounds all chord tones at once. */
function chordBlueprint(frequencies: number[]): SoundBlueprint {
  return {
    sources: frequencies.map((frequency) => ({
      type: 'oscillator' as const,
      oscillatorType: 'triangle' as const,
      frequency
    })),
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.6 },
    filter: { type: 'biquad', filterType: 'lowpass', frequency: 2800, Q: 0.7 },
    duration: 1.4
  }
}

export const chordCommand: CommandDefinition = {
  name: 'chord',
  description: 'Plays a chord (e.g. "chord Cmaj7", "chord A min").',
  execute: (args = []): CommandResult => {
    if (!args[0] || args[0] === 'list') {
      return { output: `Available chord types:\n  ${Object.keys(CHORDS).join(', ')}\n\nUsage: chord Cmaj7  |  chord A min` }
    }

    // Accept both "chord Cmaj7" and "chord C maj7".
    const parsed = parseChordToken(args[0], args[1])
    if (!parsed) {
      return { output: `Invalid chord: '${args.join(' ')}'.` }
    }

    const frequencies = chordFrequencies(parsed.root, parsed.type)
    if (!frequencies) {
      return { output: `Unknown chord '${parsed.root} ${parsed.type}'. Try 'chord list'.` }
    }

    return {
      output: `♬ ${parsed.root} ${parsed.type} — ${frequencies.length} notes`,
      soundBlueprint: chordBlueprint(frequencies)
    }
  },
  argSet: [
    { literal: 'list', description: 'List available chord types.' },
    {
      placeholder: 'chord',
      description: 'A chord like Cmaj7 or "A min" (root + type).'
    }
  ]
}
