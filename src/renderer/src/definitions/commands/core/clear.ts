// file: src/renderer/src/definitions/commands/core/clear.ts
import { CommandDefinition } from '../types'

export const clearCommand: CommandDefinition = {
  name: 'clear',
  description: 'Clears the terminal output.',
  staticActions: ['clearHistory'],
  execute: () => ({
    output: ''
  })
}