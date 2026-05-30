import { CommandDefinition, CommandResult } from '../types'
import { SoundBlueprint } from '@/renderer/lib/audio/audioBlueprints.ts'

// A short noise burst that sounds like dice clattering on a table.
const clatter: SoundBlueprint = {
  sources: [{ type: 'noise', noiseType: 'white' }],
  envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.08 },
  filter: { type: 'biquad', filterType: 'bandpass', frequency: 2500, Q: 1.5 },
  duration: 0.25
}

export const rollCommand: CommandDefinition = {
  name: 'roll',
  description: 'Rolls dice in NdM notation (e.g. "roll 2d6", "roll d20").',
  soundBlueprint: clatter,
  execute: (args = []): CommandResult => {
    const spec = (args[0] ?? '1d6').toLowerCase()
    const match = /^(\d*)d(\d+)$/.exec(spec)
    if (!match) {
      return { output: `Invalid dice: '${spec}'. Use NdM, e.g. 2d6 or d20.` }
    }

    const count = Math.min(parseInt(match[1] || '1', 10), 100)
    const sides = parseInt(match[2], 10)
    if (count < 1 || sides < 1) {
      return { output: `Dice must have at least 1 die and 1 side.` }
    }

    const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides))
    const total = rolls.reduce((a, b) => a + b, 0)
    const detail = count > 1 ? `  [${rolls.join(', ')}]` : ''
    return { output: `🎲 ${spec} → ${total}${detail}` }
  },
  argSet: [
    { placeholder: 'NdM', description: 'Dice spec like 2d6, d20, 3d8 (default: 1d6).' }
  ]
}
