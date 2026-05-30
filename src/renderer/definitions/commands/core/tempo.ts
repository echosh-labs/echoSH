import { CommandDefinition, CommandResult } from '../types'
import { audioEngine } from '@/renderer/lib/audio/audioEngine.ts'

export const tempoCommand: CommandDefinition = {
  name: 'tempo',
  description: 'Gets or sets the playback tempo in BPM, used by scale/melody/arp/beat.',
  execute: (args = []): CommandResult => {
    if (!args[0]) {
      return { output: `Tempo: ${audioEngine.getBpm()} bpm` }
    }

    const bpm = parseFloat(args[0])
    if (isNaN(bpm)) {
      return { output: `Invalid tempo: '${args[0]}'. Provide a number, e.g. tempo 140.` }
    }

    audioEngine.setBpm(bpm)
    return { output: `Tempo set to ${audioEngine.getBpm()} bpm` }
  },
  argSet: [
    { placeholder: 'bpm', description: 'Beats per minute (20–400).' }
  ]
}
