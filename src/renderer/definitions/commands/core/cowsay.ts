import { CommandDefinition, CommandResult } from '../types'
import { SoundBlueprint } from '@/renderer/lib/audio/audioBlueprints.ts'

// A low, nasal "moo".
const moo: SoundBlueprint = {
  sources: [
    { type: 'oscillator', oscillatorType: 'sawtooth', frequency: 140 },
    { type: 'oscillator', oscillatorType: 'sawtooth', frequency: 145, detune: -10 }
  ],
  envelope: { attack: 0.08, decay: 0.2, sustain: 0.4, release: 0.4 },
  filter: { type: 'biquad', filterType: 'lowpass', frequency: 700, Q: 4 },
  lfo: { type: 'sine', frequency: 6, depth: 20, affects: { target: 'source', param: 'frequency' } },
  duration: 1
}

const COW = `        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`

export const cowsayCommand: CommandDefinition = {
  name: 'cowsay',
  description: 'A cow says whatever you tell it to. Moo.',
  soundBlueprint: moo,
  execute: (args = []): CommandResult => {
    const message = args.join(' ') || 'Moo!'
    const top = ' ' + '_'.repeat(message.length + 2)
    const bottom = ' ' + '-'.repeat(message.length + 2)
    const bubble = `${top}\n< ${message} >\n${bottom}`
    return { output: `${bubble}\n${COW}` }
  },
  argSet: [
    { placeholder: 'message...', description: 'What the cow should say.' }
  ]
}
