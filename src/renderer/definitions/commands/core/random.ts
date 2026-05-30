import { CommandDefinition, CommandResult } from '../types'
import {
  BiquadFilterType,
  NoiseType,
  OscillatorType,
  SoundBlueprint
} from '@/renderer/lib/audio/audioBlueprints.ts'

const OSC_TYPES: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle']
const NOISE_TYPES: NoiseType[] = ['white', 'pink', 'brown']
const FILTER_TYPES: BiquadFilterType[] = ['lowpass', 'highpass', 'bandpass', 'peaking', 'notch']

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** Builds a randomized, hopefully-interesting sound blueprint. */
function randomBlueprint(): SoundBlueprint {
  const sourceCount = 1 + Math.floor(Math.random() * 3)
  const sources: SoundBlueprint['sources'] = []
  for (let i = 0; i < sourceCount; i++) {
    if (Math.random() < 0.75) {
      sources.push({
        type: 'oscillator',
        oscillatorType: pick(OSC_TYPES),
        frequency: rand(80, 1200),
        detune: rand(-30, 30)
      })
    } else {
      sources.push({ type: 'noise', noiseType: pick(NOISE_TYPES) })
    }
  }

  const duration = rand(0.2, 2)
  const blueprint: SoundBlueprint = {
    sources,
    envelope: {
      attack: rand(0.001, 0.3),
      decay: rand(0.05, 0.5),
      sustain: rand(0, 0.6),
      release: rand(0.05, 1)
    },
    filter: {
      type: 'biquad',
      filterType: pick(FILTER_TYPES),
      frequency: rand(200, 6000),
      Q: rand(0.5, 8),
      gain: rand(-10, 20)
    },
    duration
  }

  if (Math.random() < 0.4) {
    blueprint.reverb = { decay: rand(0.5, 4), mix: rand(0.2, 0.6) }
  }
  if (Math.random() < 0.3) {
    blueprint.delay = { delayTime: rand(0.05, 0.4), feedback: rand(0.2, 0.6), mix: rand(0.2, 0.5) }
  }
  if (Math.random() < 0.3) {
    blueprint.distortion = { amount: rand(10, 60), oversample: 'none' }
  }
  return blueprint
}

export const randomCommand: CommandDefinition = {
  name: 'random',
  description: 'Generates and plays a completely random sound.',
  execute: (): CommandResult => {
    const blueprint = randomBlueprint()
    const summary = blueprint.sources
      .map((s) => (s.type === 'oscillator' ? `${s.oscillatorType}@${s.frequency.toFixed(0)}Hz` : `${s.noiseType} noise`))
      .join(' + ')
    return {
      output: `🎲 Random sound: ${summary} (${blueprint.duration.toFixed(2)}s)`,
      soundBlueprint: blueprint
    }
  },
  argSet: []
}
