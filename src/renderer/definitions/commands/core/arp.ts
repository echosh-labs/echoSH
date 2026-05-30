import { CommandDefinition, CommandResult } from '../types'
import { audioEngine, SequenceEvent } from '@/renderer/lib/audio/audioEngine.ts'
import { chordFrequencies, parseChordToken } from '@/renderer/lib/audio/musicTheory.ts'

type Direction = 'up' | 'down' | 'updown'

export const arpCommand: CommandDefinition = {
  name: 'arp',
  description: 'Arpeggiates a chord (e.g. "arp Cmaj7 up", "arp Am down").',
  execute: (args = []): CommandResult => {
    if (!args[0]) {
      return { output: 'Usage: arp <chord> [up|down|updown]  e.g. arp Cmaj7 up' }
    }

    const parsed = parseChordToken(args[0], undefined)
    if (!parsed) {
      return { output: `Invalid chord: '${args[0]}'.` }
    }

    let frequencies = chordFrequencies(parsed.root, parsed.type)
    if (!frequencies) {
      return { output: `Unknown chord '${parsed.root} ${parsed.type}'. Try 'chord list'.` }
    }

    const direction = (args[1]?.toLowerCase() as Direction) || 'up'
    if (direction === 'down') {
      frequencies = [...frequencies].reverse()
    } else if (direction === 'updown') {
      frequencies = [...frequencies, ...[...frequencies].reverse().slice(1, -1)]
    }

    // Arpeggios run at eighth-note speed for a livelier feel.
    const step = (60 / audioEngine.getBpm()) / 2
    const events: SequenceEvent[] = frequencies.map((frequency, i) => ({
      frequency,
      time: i * step,
      duration: step * 0.9
    }))
    audioEngine.playSequence(events)

    return { output: `↟ Arpeggiating ${parsed.root} ${parsed.type} (${direction})` }
  },
  argSet: [
    {
      placeholder: 'chord',
      description: 'A chord like Cmaj7 or Am.',
      args: [{ placeholder: 'direction', description: 'up | down | updown (default: up).' }]
    }
  ]
}
