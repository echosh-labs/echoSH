import { CommandDefinition, CommandResult } from '../types'

export const historyCommand: CommandDefinition = {
  name: 'history',
  description: 'Lists previously run commands. Use "history clear" to wipe it.',
  execute: (args = [], contexts): CommandResult => {
    const items = (contexts.history ?? []).filter((h) => !h.cleared)

    if (args[0] === 'clear') {
      contexts.setHistory((contexts.history ?? []).map((h) => ({ ...h, cleared: true })))
      return { output: 'History cleared.' }
    }

    if (items.length === 0) {
      return { output: 'No history yet.' }
    }

    const output = items
      .map((item, i) => `  ${String(i + 1).padStart(3)}  ${item.command}`)
      .join('\n')
    return { output }
  },
  argSet: [
    { literal: 'clear', description: 'Clear the command history.' }
  ]
}
