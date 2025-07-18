import { CommandDefinition } from '../types'

export const testErrorCommand: CommandDefinition = {
  name: 'test:error',
  description: 'Triggers the custom error sound for testing.',
  soundEffect: 'error',
  execute: () => 'Error: This is a test error.'
}
