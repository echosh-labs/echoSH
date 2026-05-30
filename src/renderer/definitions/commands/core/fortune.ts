import { CommandDefinition, CommandResult } from '../types'
import { SoundBlueprint } from '@/renderer/lib/audio/audioBlueprints.ts'

const QUOTES: string[] = [
  'Music is the space between the notes. — Claude Debussy',
  'There are no wrong notes; some are just more right than others. — Thelonious Monk',
  'Code is poetry; this terminal just makes it sing.',
  'Simplicity is the ultimate sophistication. — Leonardo da Vinci',
  'The most important instrument is the ear.',
  'A good programmer is someone who always looks both ways before crossing a one-way street.',
  'Premature optimization is the root of all evil. — Donald Knuth',
  'Without music, life would be a mistake. — Friedrich Nietzsche',
  'Make it work, make it right, make it fast.',
  'Every great composition started as a single note.'
]

// A gentle two-note chime.
const chime: SoundBlueprint = {
  sources: [
    { type: 'oscillator', oscillatorType: 'sine', frequency: 880 },
    { type: 'oscillator', oscillatorType: 'sine', frequency: 1320 }
  ],
  envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.6 },
  reverb: { decay: 1.5, mix: 0.3 },
  duration: 1
}

export const fortuneCommand: CommandDefinition = {
  name: 'fortune',
  description: 'Prints a random quote about code and music.',
  soundBlueprint: chime,
  execute: (): CommandResult => {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
    return { output: quote }
  },
  argSet: []
}
