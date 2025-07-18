import { CommandDefinition } from '../types'

export const toggleLatencyCommand: CommandDefinition = {
  name: 'toggle:latency',
  description: 'Shows or hides the audio latency diagnostic widget.',
  staticActions: ['toggleLatencyWidget'],
  staticSoundEvents: ['commandSuccess'],
  execute: () => ({
    output: 'Toggling audio latency widget...'
  })
}
