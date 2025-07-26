/**
 * @file src/renderer/definitions/commands/core/presets.ts
 * @description Command to interact with a library of pre-defined sounds for the 'raw' command.
 * This command allows users to list, search, and play sounds from a creative collection,
 * making it easy to explore the capabilities of the synthesis engine.
 */

import { CommandDefinition, CommandResult } from '../types'
// It's generally better to keep source files within the `src` directory.
// Consider moving `raw-presets.ts` to `src/renderer/lib/audio/presets/` for better organization.
import { rawPresets } from '../../../lib/audio/raw-presets.ts'
import { buildBlueprintFromKeywords } from './raw'

const HELP_TEXT = `Usage: presets [subcommand] [query]
Access and play pre-defined sounds from the preset library.

Subcommands:
  list              List all available presets, grouped by category. (Default)
  play "<name>"     Play a preset by its full name in quotes.
  search <term>     Search for presets by name or description.

Examples:
  presets
  presets play "Kick Drum (Tight)"
  presets search laser
`

/**
 * Finds a preset by its name, ignoring case and surrounding quotes.
 * @param name The name of the preset to find.
 * @returns The found preset object or undefined.
 */
const findPreset = (name: string) => {
  const lowerCaseName = name.toLowerCase().trim().replace(/"/g, '')
  return rawPresets.find((p) => p.name.toLowerCase() === lowerCaseName)
}

/**
 * A map of subcommand handlers for the 'presets' command. This data-driven approach
 * replaces a switch statement, making the command easier to maintain and extend.
 */
const subcommands: Record<string, (arg: string) => CommandResult> = {
  play: (argument: string): CommandResult => {
    if (!argument) {
      return { output: 'Error: Missing preset name. Usage: presets play "<name>"' }
    }
    const preset = findPreset(argument)
    if (!preset) {
      return { output: `Error: Preset "${argument}" not found.` }
    }

    // The command in the preset includes "raw", so we need to strip it.
    const keywords = preset.command.split(' ').slice(1)
    const { blueprint } = buildBlueprintFromKeywords(keywords)

    return {
      output: `Playing preset: ${preset.name}`,
      soundBlueprint: blueprint
    }
  },

  search: (argument: string): CommandResult => {
    const searchTerm = argument.toLowerCase()
    if (!searchTerm) {
      return { output: 'Error: Missing search term. Usage: presets search <term>' }
    }
    const results = rawPresets.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
    )

    if (results.length === 0) {
      return { output: `No presets found matching "${argument}".` }
    }

    const output = results
      .map((p) => `  - "${p.name}": ${p.description}`)
      .join('\n')
    return { output: `Found ${results.length} presets:\n${output}` }
  },

  list: (): CommandResult => {
    const categories: Record<string, string[]> = {}
    rawPresets.forEach((p) => {
      if (!categories[p.category]) {
        categories[p.category] = []
      }
      categories[p.category].push(`  - "${p.name}": ${p.description}`)
    })

    const output = Object.entries(categories)
      .map(
        ([category, presets]) => `\n--- ${category.toUpperCase()} ---\n${presets.join('\n')}`
      )
      .join('\n')

    return { output: `Available Presets:${output}\n\nUse 'presets play "<name>"' to play a sound.` }
  }
}

export const presetsCommand: CommandDefinition = {
  name: 'presets',
  description: 'Lists and plays pre-defined sound presets.',
  execute: (args = []): CommandResult => {
    const subcommandName = args[0] || 'list'
    const argument = args.slice(1).join(' ')

    const handler = subcommands[subcommandName]

    if (handler) {
      return handler(argument)
    }
    // If an unknown subcommand is provided, show the help text.
    return { output: HELP_TEXT }
  },
  argSet: [
    {
      literal: 'list',
      description: 'List all available presets, grouped by category. (Default)'
    },
    {
      literal: 'play',
      description: 'Play a preset by its full name.',
      args: [
        {
          placeholder: 'preset_name',
          description: 'The name of the preset, in quotes if it contains spaces.',
          // Provide a dynamic list of preset names for autocompletion.
          getSuggestions: () => rawPresets.map((p) => `"${p.name}"`)
        }
      ]
    },
    {
      literal: 'search',
      description: 'Search for presets by name or description.',
      args: [{ placeholder: 'search_term', description: 'A term to search for.' }]
    }
  ]
}
