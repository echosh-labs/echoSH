import { CommandDefinition, CommandResult } from '../types'
import { audioEngine, SequenceEvent } from '@/renderer/lib/audio/audioEngine.ts'
import { SCALES, scaleFrequencies } from '@/renderer/lib/audio/musicTheory.ts'

export const scaleCommand: CommandDefinition = {
  name: 'scale',
  description: 'Plays an ascending scale (e.g. "scale C major", "scale A minorpentatonic").',
  execute: (args = []): CommandResult => {
    if (!args[0] || args[0] === 'list') {
      return { output: `Available scales:\n  ${Object.keys(SCALES).join(', ')}\n\nUsage: scale C major  |  scale A blues` }
    }

    const root = args[0]
    const type = (args[1] ?? 'major').toLowerCase()
    const frequencies = scaleFrequencies(root, type)
    if (!frequencies) {
      return { output: `Could not play scale '${root} ${type}'. Try 'scale list'.` }
    }

    // One note per beat at the current tempo.
    const beat = 60 / audioEngine.getBpm()
    const events: SequenceEvent[] = frequencies.map((frequency, i) => ({
      frequency,
      time: i * beat,
      duration: beat * 0.9
    }))
    audioEngine.playSequence(events)

    return { output: `↗ ${root} ${type} scale (${frequencies.length} notes @ ${audioEngine.getBpm()} bpm)` }
  },
  argSet: [
    { literal: 'list', description: 'List available scale types.' },
    {
      placeholder: 'root',
      description: 'Root note (e.g. C4 or C).',
      args: [{ placeholder: 'type', description: 'Scale type (default: major).' }]
    }
  ]
}
