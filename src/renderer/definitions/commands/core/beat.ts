import { CommandDefinition, CommandResult } from '../types'
import { audioEngine, SequenceEvent } from '@/renderer/lib/audio/audioEngine.ts'
import { SoundBlueprint } from '@/renderer/lib/audio/audioBlueprints.ts'
import { rawPresets } from '@/renderer/lib/audio/raw-presets.ts'
import { buildBlueprintFromKeywords } from './raw'

/** Builds a drum blueprint from a named preset's keyword command. */
function drumFromPreset(name: string): SoundBlueprint | null {
  const preset = rawPresets.find((p) => p.name === name)
  if (!preset) return null
  return buildBlueprintFromKeywords(preset.command.split(' ').slice(1)).blueprint
}

// Map pattern characters to drum sounds. Built once and reused per step.
const DRUMS: Record<string, SoundBlueprint | null> = {
  x: drumFromPreset('Kick Drum (Tight)'),
  o: drumFromPreset('Snare Drum'),
  '-': drumFromPreset('Closed Hi-Hat')
}

/** A few ready-made patterns so users can hear something instantly. */
const NAMED_PATTERNS: Record<string, string> = {
  fourfloor: 'x-x-x-x-x-x-x-x-',
  rock: 'x--o--x-x--o----',
  hihat: '----------------'.replace(/./g, '-'),
  backbeat: 'x..o..x.x..o....'
}

const LEGEND = 'x=kick  o=snare  -=hi-hat  .=rest'

export const beatCommand: CommandDefinition = {
  name: 'beat',
  description:
    'Plays a step-sequenced drum pattern once (e.g. beat "x..o..x.x..o...."). Use `loop` instead for continuous playback.',
  execute: (args = []): CommandResult => {
    if (!args[0] || args[0] === 'list') {
      const names = Object.keys(NAMED_PATTERNS).join(', ')
      return {
        output:
          `Usage: beat <pattern>\n  ${LEGEND}\n\n` +
          `Named patterns: ${names}\n` +
          `Examples:\n  beat "x..o..x.x..o...."\n  beat fourfloor`
      }
    }

    const pattern = NAMED_PATTERNS[args[0].toLowerCase()] ?? args.join('')
    const steps = pattern.split('')

    // 16th-note grid at the current tempo.
    const stepDur = (60 / audioEngine.getBpm()) / 4
    const events: SequenceEvent[] = []
    steps.forEach((char, i) => {
      const blueprint = DRUMS[char]
      if (blueprint) {
        events.push({ blueprint, time: i * stepDur, duration: stepDur })
      }
    })

    if (events.length === 0) {
      return { output: `No drum hits in pattern. ${LEGEND}` }
    }

    audioEngine.playSequence(events)
    return { output: `🥁 ${pattern}  (${events.length} hits @ ${audioEngine.getBpm()} bpm)` }
  },
  argSet: [
    { literal: 'list', description: 'Show named patterns and the legend.' },
    {
      placeholder: 'pattern',
      description: `A pattern string (${LEGEND}) or a named pattern.`,
      getSuggestions: (current: string) =>
        Object.keys(NAMED_PATTERNS).filter((p) => p.startsWith(current.toLowerCase()))
    }
  ]
}
