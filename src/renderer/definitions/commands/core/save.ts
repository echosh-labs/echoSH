import { CommandDefinition, CommandResult } from '../types'
import { SoundBlueprint } from '@/renderer/lib/audio/audioBlueprints.ts'
import { savedSounds } from '@/renderer/lib/audio/savedSounds.ts'

const HELP_TEXT = `Usage: save [name | subcommand]
Save the last sound produced by 'random' or 'raw' so you can replay it later.

  save                 Save the last sound under an auto-generated name.
  save <name>          Save the last sound as <name>.
  save list            List every saved sound.
  save rm <name>       Delete a saved sound.

Replay a saved sound with the 'play' command:
  random
  save warble
  play warble

You can also save inline:  raw osc:sine:440 --save beep`

// A short, satisfying confirmation blip for a successful save.
const blip: SoundBlueprint = {
  sources: [
    { type: 'oscillator', oscillatorType: 'sine', frequency: 880 },
    { type: 'oscillator', oscillatorType: 'sine', frequency: 1174.66 }
  ],
  envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.12 },
  duration: 0.25
}

/** A compact, human-readable description of a blueprint's sources. */
const summarize = (b: SoundBlueprint): string =>
  b.sources
    .map((s) =>
      s.type === 'oscillator' ? `${s.oscillatorType}@${s.frequency.toFixed(0)}Hz` : `${s.noiseType} noise`
    )
    .join(' + ')

const subcommands: Record<string, (arg: string) => CommandResult> = {
  list: (): CommandResult => {
    const sounds = savedSounds.list()
    if (sounds.length === 0) {
      return { output: "No saved sounds yet. Run 'random', then 'save'." }
    }
    const lines = sounds.map((s) => `  - "${s.name}": ${summarize(s.blueprint)} (${s.blueprint.duration.toFixed(2)}s)`)
    return { output: `Saved sounds:\n${lines.join('\n')}\n\nUse 'play <name>' to hear one.` }
  },

  rm: (argument: string): CommandResult => {
    if (!argument) {
      return { output: 'Error: Missing name. Usage: save rm "<name>"' }
    }
    const removed = savedSounds.remove(argument.replace(/"/g, ''))
    return {
      output: removed ? `🗑️  Removed saved sound "${argument}".` : `Error: No saved sound named "${argument}".`
    }
  }
}

// Aliases for the delete subcommand.
subcommands.remove = subcommands.rm
subcommands.delete = subcommands.rm

export const saveCommand: CommandDefinition = {
  name: 'save',
  description: 'Saves the last random sound so you can replay it later.',
  execute: (args = [], contexts): CommandResult => {
    const sub = args[0]?.toLowerCase()

    if (sub === 'help') {
      return { output: HELP_TEXT }
    }

    const handler = sub ? subcommands[sub] : undefined
    if (handler) {
      return handler(args.slice(1).join(' '))
    }

    // Otherwise: save the last generated sound, treating any args as its name.
    const blueprint = contexts.lastBlueprint
    if (!blueprint) {
      return { output: "No sound to save yet. Run 'random' or 'raw' first." }
    }

    const name = args.join(' ').trim() || savedSounds.nextName()
    savedSounds.save(name, blueprint)
    return {
      output: `💾 Saved last sound as "${name}". Replay it with: play ${name}`,
      soundBlueprint: blip
    }
  },
  argSet: [
    { placeholder: 'name', description: 'A name to save the last random sound under.' },
    {
      literal: 'list',
      description: 'List every saved sound.'
    },
    {
      literal: 'rm',
      description: 'Delete a saved sound.',
      args: [
        {
          placeholder: 'name',
          description: 'The name of a saved sound.',
          getSuggestions: () => savedSounds.list().map((s) => `"${s.name}"`)
        }
      ]
    }
  ]
}
