import { CommandDefinition, CommandResult } from '../types'
import { SoundBlueprint } from '@/renderer/lib/audio/audioBlueprints.ts'

// A warm, ascending major-9th shimmer — Claude's little signature jingle.
const jingle: SoundBlueprint = {
  sources: [
    { type: 'oscillator', oscillatorType: 'sine', frequency: 523.25 }, // C5
    { type: 'oscillator', oscillatorType: 'sine', frequency: 659.25 }, // E5
    { type: 'oscillator', oscillatorType: 'triangle', frequency: 783.99 }, // G5
    { type: 'oscillator', oscillatorType: 'sine', frequency: 987.77 } // B5
  ],
  envelope: { attack: 0.02, decay: 0.4, sustain: 0.25, release: 1.2 },
  filter: { type: 'biquad', filterType: 'lowpass', frequency: 2600, Q: 0.7 },
  reverb: { decay: 2.4, mix: 0.35 },
  duration: 1.6
}

// The unmistakable Anthropic sunburst, rendered in glorious ASCII.
const BURST = `        \\  |  /
         \\ | /
      --   *   --
         / | \\
        /  |  \\`

const GREETINGS: string[] = [
  "Hi, I'm Claude. I turn coffee and context windows into code.",
  "Claude here. I read the whole file before editing it — promise.",
  "Claude reporting for duty. Let's make something that compiles.",
  "Hey! I'm Claude. I'll be your pair programmer this evening.",
  "Claude online. Tabs or spaces? ...I'll match your existing style."
]

// Tongue-in-cheek "answers" so `claude <question>` feels alive offline.
const QUIPS: string[] = [
  "Great question. The answer is almost certainly 'it depends'.",
  "Let me think... done. Have you tried turning the bug into a feature?",
  "I'd run the tests first, but you didn't ask, so: looks good to me. 🚀",
  "That's a one-liner. It's just a very, very long line.",
  "Working on it... 100% (this percentage is not based on real data).",
  "Have you considered solving it with more music? This terminal can.",
  "I checked the docs so you don't have to. They were, regrettably, fine."
]

const pick = (xs: string[]): string => xs[Math.floor(Math.random() * xs.length)]

export const claudeCommand: CommandDefinition = {
  name: 'claude',
  description: 'Summon Claude for a greeting — or ask it anything.',
  soundBlueprint: jingle,
  execute: (args = []): CommandResult => {
    const prompt = args.join(' ').trim()
    const message = prompt ? `> ${prompt}\n\n${pick(QUIPS)}` : pick(GREETINGS)
    return { output: `${BURST}\n\n${message}` }
  },
  argSet: [
    { placeholder: 'prompt...', description: 'Optionally ask Claude something.' }
  ]
}
