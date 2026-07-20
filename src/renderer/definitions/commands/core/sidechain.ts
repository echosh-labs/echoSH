import { CommandDefinition, CommandResult } from '../types'
import { isSidechainEnabled, setSidechainEnabled } from '@/renderer/lib/audio/sidechain.ts'

export const sidechainCommand: CommandDefinition = {
  name: 'sidechain',
  description: "Toggles the sonification of Claude's streaming responses.",
  execute: (args = []): CommandResult => {
    const arg = args[0]?.toLowerCase()

    // No argument toggles, matching how `mute` behaves.
    const next =
      arg === 'on' ? true
      : arg === 'off' ? false
      : !isSidechainEnabled()

    if (arg && arg !== 'on' && arg !== 'off') {
      return { output: `Usage: sidechain [on|off]` }
    }

    setSidechainEnabled(next)
    return {
      output: next
        ? 'Sidechain on — Claude\'s responses will play as they stream.'
        : 'Sidechain off.'
    }
  },
  argSet: [
    { literal: 'on', description: 'Enable response sonification.' },
    { literal: 'off', description: 'Disable response sonification.' }
  ]
}
