import { CommandDefinition } from '../types'

export const clearCommand: CommandDefinition = {
  name: 'clear',
  description: 'Clears the terminal output.',
  action: 'clearHistory',
  soundEffect: 'none',
  execute: () => '' // No output message is needed for this action.
}
