import { CommandDefinition } from '../types'

export const toggleLatencyCommand: CommandDefinition = {
  name: 'toggle:latency',
  description: 'Shows or hides the audio latency diagnostic widget.',
  action: 'toggleLatencyWidget',
  soundEffect: 'command',
  execute: () => 'Toggling audio latency widget...'
}
