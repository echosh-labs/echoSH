/**
 * @file commandProcessor.ts
 * @description A dynamic command processing engine that loads and executes command definitions.
 */

import { CommandDefinition, CommandResult } from '../../definitions/commands/types'
import { coreCommands } from '../../definitions/commands/core'

/**
 * A class-based command processor for better state management and initialization.
 */
class CommandProcessor {
  // Use a Map for efficient, case-insensitive command lookups.
  private readonly commands: Map<string, CommandDefinition>

  constructor() {
    this.commands = new Map()
    this.loadCommands(coreCommands)
  }

  /**
   * Loads an array of command definitions into the command map.
   * @param commandList An array of objects conforming to the CommandDefinition interface.
   */
  public loadCommands(commandList: CommandDefinition[]): void {
    commandList.forEach((command) => {
      this.commands.set(command.name.toLowerCase(), command)
    })
    // In the future, this could be extended to load commands from other sources (e.g., plugins).
  }

  /**
   * Parses a raw input string, finds the corresponding command, and executes it.
   * @param input The raw command string from the terminal.
   * @returns A CommandResult object with the output and any triggered actions or sound effects.
   */
  public process(input: string): CommandResult {
    const trimmedInput = input.trim()
    if (!trimmedInput) {
      // Return a default empty result if there's no input.
      return { output: '', soundEffect: 'none' }
    }

    const [commandName, ...args] = trimmedInput.split(/\s+/)
    const command = this.commands.get(commandName.toLowerCase())

    if (command) {
      // Execute the command's defined function and return the result.
      const output = command.execute(args)
      return {
        output,
        action: command.action,
        soundEffect: command.soundEffect
      }
    } else {
      // Handle the case where the command is not found.
      return {
        output: `Command not found: ${commandName}`,
        soundEffect: 'error'
      }
    }
  }
}

// Export a singleton instance of the processor.
const commandProcessor = new CommandProcessor()

// Expose the process method directly for ease of use.
export const processCommand = (input: string): CommandResult => {
  return commandProcessor.process(input)
}
