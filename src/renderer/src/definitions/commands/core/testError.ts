import { CommandDefinition } from '../types'

export const testErrorCommand: CommandDefinition = {
  name: 'test:error',
  description: 'Triggers the custom error sound for testing.',
  staticSoundEvents: ['invalidCommand'],
  execute: () => ({
    output: 'Error: This is a test error.'
  })
}
