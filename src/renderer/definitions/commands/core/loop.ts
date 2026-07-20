import { CommandDefinition, CommandResult } from '../types'
import { audioEngine } from '@/renderer/lib/audio/audioEngine.ts'
import { loopEngine, TrackInfo } from '@/renderer/lib/audio/loopEngine.ts'
import {
  DRUM_LEGEND,
  MAX_TRACKS,
  MELODIC_VOICES,
  parsePattern,
  SUBDIVISIONS
} from '@/renderer/lib/audio/loopPattern.ts'

// The switch below claims `list`, `start`, `stop`, `clear`, `drop`, `mute`,
// `unmute`, `solo`, `vol`, and `help` for the mixer, so those words can't be
// used as track names — `loop stop` has to mean one thing.

const USAGE = [
  'Usage: loop <name> <pattern>   — start or replace a looping track',
  '',
  `  Drums:  loop kick x---x---x---x---        ${DRUM_LEGEND}`,
  '  Notes:  loop bass @bass C2 . Eb2 . G2 . . .',
  '',
  `  @voice   ${MELODIC_VOICES.join(', ')}  (implies a note track)`,
  `  @step    ${SUBDIVISIONS.join(', ')}  (default 16n for drums, 8n for notes)`,
  '',
  'Mixing while it plays:',
  '  loop list              show the running tracks',
  '  loop vol <name> <0-1>  set a track level',
  '  loop mute|unmute|solo <name>',
  '  loop drop <name>       remove one track',
  '  loop stop | start      pause or resume everything',
  '  loop clear             remove every track',
  '',
  'Tracks keep looping until stopped, and every track shares one grid — so',
  'layers added at different times stay locked together. `tempo` retunes the',
  'whole mix live.'
].join('\n')

function describe(track: TrackInfo): string {
  const state = track.muted ? 'muted' : `${Math.round(track.level * 100)}%`
  const voice = track.kind === 'note' ? track.voice : 'drums'
  return `  ${track.name.padEnd(10)} ${voice.padEnd(6)} ${track.subdivision.padEnd(4)} ${state.padEnd(6)} ${track.pattern}`
}

function listTracks(): string {
  const tracks = loopEngine.list()
  if (!tracks.length) return 'No loops running. Try: loop kick x---x---x---x---'

  const state = loopEngine.isPlaying() ? 'playing' : 'stopped'
  return [
    `${tracks.length} track${tracks.length === 1 ? '' : 's'} @ ${audioEngine.getBpm()} bpm (${state})`,
    ...tracks.map(describe)
  ].join('\n')
}

export const loopCommand: CommandDefinition = {
  name: 'loop',
  description:
    'Runs continuous, layered loops you can mix live — add, mute, level, or drop tracks while they play.',
  execute: (args = []): CommandResult => {
    const [first, ...rest] = args
    const subcommand = first?.toLowerCase()

    if (!first) return { output: listTracks() }

    switch (subcommand) {
      case 'help':
        return { output: USAGE }

      case 'list':
        return { output: listTracks() }

      case 'start': {
        if (!loopEngine.list().length) {
          return { output: 'Nothing to start. Add a track first, e.g. loop kick x---x---x---x---' }
        }
        loopEngine.start()
        return { output: `▶ ${listTracks()}` }
      }

      case 'stop':
        loopEngine.stop()
        return { output: '⏸ Loops paused. `loop start` resumes the mix.' }

      case 'clear': {
        const count = loopEngine.clear()
        return { output: count ? `Cleared ${count} track(s).` : 'No loops running.' }
      }

      case 'drop': {
        const name = rest[0]?.toLowerCase()
        if (!name) return { output: 'Usage: loop drop <name>' }
        return {
          output: loopEngine.drop(name) ? `Dropped '${name}'.` : `No track named '${name}'.`
        }
      }

      case 'mute':
      case 'unmute': {
        const name = rest[0]?.toLowerCase()
        if (!name) return { output: `Usage: loop ${subcommand} <name>` }
        const muted = subcommand === 'mute'
        return {
          output: loopEngine.setMuted(name, muted)
            ? `${muted ? 'Muted' : 'Unmuted'} '${name}'.`
            : `No track named '${name}'.`
        }
      }

      case 'solo': {
        const name = rest[0]?.toLowerCase()
        if (!name) return { output: 'Usage: loop solo <name>' }
        return {
          output: loopEngine.solo(name)
            ? `Soloed '${name}'. Unmute the others to bring them back.`
            : `No track named '${name}'.`
        }
      }

      case 'vol': {
        const name = rest[0]?.toLowerCase()
        const level = parseFloat(rest[1])
        if (!name || isNaN(level)) return { output: 'Usage: loop vol <name> <0-1>' }
        return {
          output: loopEngine.setLevel(name, level)
            ? `'${name}' at ${Math.round(Math.max(0, Math.min(1, level)) * 100)}%.`
            : `No track named '${name}'.`
        }
      }
    }

    // Anything else names a track to create or replace.
    const name = first.toLowerCase()
    if (!rest.length) return { output: `Usage: loop ${name} <pattern>\n\n${USAGE}` }

    const parsed = parsePattern(rest)
    if (!parsed.ok) return { output: parsed.error }

    const { kind, steps, pattern, voice, subdivision, hits } = parsed.value
    const replacing = loopEngine.has(name)

    if (!replacing && loopEngine.list().length >= MAX_TRACKS) {
      return {
        output: `Already running ${MAX_TRACKS} tracks — drop one first (loop drop <name>).`
      }
    }

    // `setTrack` is async only because it may have to resume a suspended audio
    // context, while commands return synchronously. The pre-checks above cover
    // the cases worth a message; anything left is an audio-graph failure.
    void loopEngine.setTrack({ name, kind, pattern, steps, voice, subdivision }).then((info) => {
      if (!info) console.warn(`loop: could not start '${name}' — audio unavailable`)
    })

    const label = kind === 'note' ? voice : 'drums'
    return {
      output: `${replacing ? '↻' : '▶'} ${name} [${label}] ${pattern}  (${hits} hits, ${steps.length}×${subdivision} @ ${audioEngine.getBpm()} bpm)`
    }
  },
  argSet: [
    { literal: 'list', description: 'Show the running tracks and their levels.' },
    { literal: 'start', description: 'Resume playback of the existing tracks.' },
    { literal: 'stop', description: 'Pause every loop without discarding it.' },
    { literal: 'clear', description: 'Remove every track.' },
    { literal: 'help', description: 'Full syntax, drum legend, and voices.' },
    {
      literal: 'drop',
      description: 'Remove one track.',
      args: [{ placeholder: 'name', description: 'The track to remove.' }]
    },
    {
      literal: 'mute',
      description: 'Silence a track, keeping it in the mix.',
      args: [{ placeholder: 'name', description: 'The track to mute.' }]
    },
    {
      literal: 'unmute',
      description: 'Bring a muted track back.',
      args: [{ placeholder: 'name', description: 'The track to unmute.' }]
    },
    {
      literal: 'solo',
      description: 'Mute every track except this one.',
      args: [{ placeholder: 'name', description: 'The track to solo.' }]
    },
    {
      literal: 'vol',
      description: 'Set a track level from 0 to 1.',
      args: [
        { placeholder: 'name', description: 'The track to adjust.' },
        { placeholder: 'level', description: '0 (silent) to 1 (full).' }
      ]
    },
    {
      placeholder: 'name',
      description: 'A track name. Reusing one replaces its pattern, keeping its level.',
      getSuggestions: (current: string) =>
        loopEngine
          .list()
          .map((track) => track.name)
          .filter((track) => track.startsWith(current.toLowerCase()))
    },
    {
      placeholder: 'pattern',
      description:
        `Drum grid (${DRUM_LEGEND}) or space-separated notes with octaves ` +
        `(C2 . Eb2 .), chords joined with + (C4+E4+G4). Add @${MELODIC_VOICES.join('/@')} ` +
        `for a melodic voice and @16n/@8n/@4n to set the step length.`
    }
  ]
}
