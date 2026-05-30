import { CommandDefinition, CommandResult } from '../types'
import { audioEngine } from '@/renderer/lib/audio/audioEngine.ts'

export const latencyCommand: CommandDefinition = {
  name: 'latency',
  description: 'Prints audio latency diagnostics.',
  execute: (): CommandResult => {
    const info = audioEngine.getLatencyInfo()
    if (!info) {
      return { output: 'Audio engine not initialized yet.' }
    }

    const ms = (s: number) => `${(s * 1000).toFixed(1)} ms`
    return {
      output: [
        `Base latency:   ${ms(info.baseLatency)}`,
        `Output latency: ${ms(info.outputLatency)}`,
        `Output device:  ${info.sinkId || 'default'}`
      ].join('\n')
    }
  },
  argSet: []
}
