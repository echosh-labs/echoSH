import { CommandDefinition } from '../types'

export const clearCommand: CommandDefinition = {
  name: 'clear',
  description: 'Clears the terminal output.',
  staticActions: ['clearHistory'],
  staticSoundEvents: ['none'],
  execute: () => ({
    output: ''
  })
}
