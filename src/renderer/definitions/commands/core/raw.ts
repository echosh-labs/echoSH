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
 * Help text for the 'raw' command.
 */
const HELP_TEXT = `Usage: raw <keywords...>
Generates a sound on-the-fly from keyword arguments.
Each keyword modifies a part of the sound blueprint, processed in order.

Example: raw osc:sawtooth:220 filter:lowpass:800 dur:0.5

--- KEYWORDS ---

osc:<type>:<freq>:<detune>
  Adds an oscillator source. Clears default source on first use.
  - type: sine, square, sawtooth, triangle (default: sine)
  - freq: frequency in Hz (default: 440)
  - detune: cents (default: 0)
  Example: raw osc:sawtooth:220 osc:sine:440:10

noise:<type>
  Adds a noise source. Clears default source on first use.
  - type: white, brown, pink (default: white)
  Example: raw noise:pink

env:<attack>:<decay>:<sustain>:<release>
  Sets the ADSR envelope. All values in seconds.
  - Defaults: 0.01:0.1:0.1:0.2
  Example: raw env:0.01:0.2:0.5:1

filter:<type>:<freq>:<q>:<gain>
  Sets a biquad filter.
  - type: lowpass, highpass, bandpass, etc. (default: lowpass)
  - freq: frequency in Hz (default: 1000)
  - q: Q-factor (default: 1)
  - gain: for peaking/shelving filters (default: 0)
  Example: raw filter:bandpass:1500:5

set:<path>:<value>
  Sets a single property on the blueprint. Useful for fine-tuning.
  - path: dot-notation path to property (e.g., envelope.attack or sources.0.frequency)
  - value: the new value for the property.
  Example: raw filter:lowpass set:filter.Q:10

--- FULL KEYWORD LIST ---
osc, noise, filter, env, reverb, delay, dur, lfo, distort, pan, comp, set

--- EXAMPLES ---

# A simple kick drum
raw osc:sine:150 env:0.01:0.2:0:0.1 dur:0.3 set:filter.frequency:400

# A simple hi-hat
raw noise:white env:0.01:0.05:0:0.01 dur:0.1 filter:highpass:7000:5

# Shimmering pad
raw osc:sawtooth:220:5 osc:sawtooth:220:-5 env:1:1:0.5:2 dur:4 filter:lowpass:1000:2 lfo:sine:4:20 reverb:3:0.7`

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

        case 'set': {
          const path = parts[1]
          const valueStr = parts[2]
          if (!path || valueStr === undefined) {
            report.push(`! Invalid 'set' usage. Format: set:path:value`)
            break
          }

          const keys = path.split('.')
          let current: any = blueprint

          // Traverse the path to find the target object
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i]
            if (current[key] === undefined || current[key] === null) {
              report.push(`! Path not found: '${path}'. Parent '${key}' does not exist.`)
              current = null
              break
            }
            current = current[key]
          }

          if (current) {
            const finalKey = keys[keys.length - 1]
            if (typeof current !== 'object') {
              report.push(`! Cannot set property on non-object at path: ${path}`)
            } else {
              const num = parseFloat(valueStr)
              const parsedValue = !isNaN(num)
                ? num
                : valueStr === 'true'
                ? true
                : valueStr === 'false'
                ? false
                : (valueStr as any) // Let it be a string
              current[finalKey] = parsedValue
              report.push(`+ Set ${path} = ${valueStr}`)
            }
          }
          break
        }

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
      return { output: HELP_TEXT }
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