import { CommandDefinition } from '../types'

// Note: This text will eventually be generated dynamically by the command loader.
const helpText = 'Available commands: clear, help, test:error, toggle:latency'

export const helpCommand: CommandDefinition = {
  name: 'help',
  description: 'Displays a list of available commands.',
  soundEffect: 'command',
  execute: () => helpText
}
