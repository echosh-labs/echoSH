import { CommandDefinition, CommandResult } from '../types'
import {
  SoundBlueprint,
  OscillatorType,
  NoiseType,
  BiquadFilterType,
  OverSampleType,
  LfoAffects
} from '../../../lib/audio/audioBlueprints'

/**
 * A default blueprint to build upon.
 */
const createDefaultBlueprint = (): SoundBlueprint => ({
  sources: [{ type: 'oscillator', oscillatorType: 'sine', frequency: 440 }],
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2 },
  duration: 0.4
})

/**
 * Parses keywords and builds a SoundBlueprint.
 * Keywords format: <type>:<param1>:<param2>...
 */
function buildBlueprintFromKeywords(keywords: string[]): {
  blueprint: SoundBlueprint
  report: string[]
} {
  const blueprint = createDefaultBlueprint()
  const report: string[] = []
  let sourcesCleared = false

  const clearSourcesIfNeeded = () => {
    if (!sourcesCleared) {
      blueprint.sources = []
      sourcesCleared = true
    }
  }

  for (const keyword of keywords) {
    const parts = keyword.toLowerCase().split(':')
    const key = parts[0]

    try {
      switch (key) {
        case 'osc':
        case 'oscillator':
          clearSourcesIfNeeded()
          blueprint.sources.push({
            type: 'oscillator',
            oscillatorType: (parts[1] as OscillatorType) || 'sine',
            frequency: parseFloat(parts[2]) || 440,
            detune: parseFloat(parts[3]) || 0
          })
          report.push(`+ Added Oscillator: ${parts.slice(1).join(':')}`)
          break

        case 'noise':
          clearSourcesIfNeeded()
          blueprint.sources.push({
            type: 'noise',
            noiseType: (parts[1] as NoiseType) || 'white'
          })
          report.push(`+ Added Noise: ${parts[1] || 'white'}`)
          break

        case 'filter':
          blueprint.filter = {
            type: 'biquad',
            filterType: (parts[1] as BiquadFilterType) || 'lowpass',
            frequency: parseFloat(parts[2]) || 1000,
            Q: parseFloat(parts[3]) || 1,
            gain: parseFloat(parts[4]) || 0
          }
          report.push(`+ Set Filter: ${parts.slice(1).join(':')}`)
          break

        case 'env':
        case 'envelope':
          blueprint.envelope = {
            attack: parseFloat(parts[1]) || 0.01,
            decay: parseFloat(parts[2]) || 0.1,
            sustain: parseFloat(parts[3]) || 0.1,
            release: parseFloat(parts[4]) || 0.2
          }
          report.push(`+ Set Envelope: ${parts.slice(1).join(':')}`)
          break

        case 'reverb':
          blueprint.reverb = {
            decay: parseFloat(parts[1]) || 1,
            mix: parseFloat(parts[2]) || 0.5,
            reverse: parts[3] === 'true'
          }
          report.push(`+ Set Reverb: ${parts.slice(1).join(':')}`)
          break

        case 'delay':
          blueprint.delay = {
            delayTime: parseFloat(parts[1]) || 0.3,
            feedback: parseFloat(parts[2]) || 0.4,
            mix: parseFloat(parts[3]) || 0.5
          }
          report.push(`+ Set Delay: ${parts.slice(1).join(':')}`)
          break

        case 'dur':
        case 'duration':
          blueprint.duration = parseFloat(parts[1]) || 0.5
          report.push(`+ Set Duration: ${parts[1]}`)
          break

        case 'lfo':
          blueprint.lfo = {
            type: (parts[1] as OscillatorType) || 'sine',
            frequency: parseFloat(parts[2]) || 5,
            depth: parseFloat(parts[3]) || 100,
            affects: (parts[4] as LfoAffects) || 'frequency'
          }
          report.push(`+ Set LFO: ${parts.slice(1).join(':')}`)
          break

        case 'distort':
        case 'distortion':
          blueprint.distortion = {
            amount: parseFloat(parts[1]) || 50,
            oversample: (parts[2] as OverSampleType) || 'none'
          }
          report.push(`+ Set Distortion: ${parts.slice(1).join(':')}`)
          break

        case 'pan':
        case 'panner':
          blueprint.panner = {
            type: 'stereo',
            pan: parseFloat(parts[1]) || 0
          }
          report.push(`+ Set Panner: ${parts[1]}`)
          break

        case 'comp':
        case 'compressor':
          blueprint.compressor = {
            threshold: parseFloat(parts[1]) || -24,
            knee: parseFloat(parts[2]) || 30,
            ratio: parseFloat(parts[3]) || 12,
            attack: parseFloat(parts[4]) || 0.003,
            release: parseFloat(parts[5]) || 0.25
          }
          report.push(`+ Set Compressor: ${parts.slice(1).join(':')}`)
          break

        default:
          report.push(`! Unknown keyword: ${keyword}`)
          break
      }
    } catch (e) {
      report.push(`! Error parsing keyword: ${keyword} - ${(e as Error).message}`)
    }
  }

  // Recalculate duration if envelope is set and duration is not explicitly set
  if (keywords.some((k) => k.startsWith('env')) && !keywords.some((k) => k.startsWith('dur'))) {
    const { attack, decay, release } = blueprint.envelope
    blueprint.duration = attack + decay + release + 0.1 // Add a little buffer
    report.push(`i Auto-calculated duration: ${blueprint.duration.toFixed(2)}s`)
  }

  return { blueprint, report }
}

export const rawCommand: CommandDefinition = {
  name: 'raw',
  description: 'Generates a sound on-the-fly from keyword arguments.',
  execute: (args = []): CommandResult => {
    if (args.length === 0) {
      return {
        output: `Usage: raw <keywords...>\nExample: raw osc:sawtooth:220 filter:lowpass:800 lfo:sine:5:100:frequency`
      }
    }

    const { blueprint, report } = buildBlueprintFromKeywords(args)

    return {
      output: `Generating sound with blueprint:\n${report.join('\n')}`,
      soundBlueprint: blueprint
    }
  },
  argSet: [
    {
      placeholder: 'keywords...',
      description: 'A space-separated list of sound-building keywords (e.g., osc:sine:440).'
    }
  ]
}