import { CommandDefinition, CommandResult } from '../types'

export const whoamiCommand: CommandDefinition = {
  name: 'whoami',
  description: 'Prints platform and echoSH version information.',
  execute: (_args, contexts): CommandResult => {
    const arch = contexts.arch ?? 'unknown'
    const version = contexts.version ?? '0.0.0'
    return {
      output: [
        `echoSH v${version}`,
        `platform: ${arch}`,
        `composer:  you 🎧`
      ].join('\n')
    }
  },
  argSet: []
}
