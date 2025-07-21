/**
 * @file src/renderer/src/lib/commands/commandProcessor.ts
 * @description A dynamic command processing engine that loads and executes command definitions,
 * combining static and runtime effects into a single result for the orchestrator.
 */

import {
  CommandDefinition,
  CommandResult,
  CommandAction
} from '../../definitions/commands/types'
import { coreCommands } from '../../definitions/commands/core'
import { SoundBlueprint } from '../audio/audioBlueprints'
import { helpCommand } from "@//renderer/definitions/commands/core/help.ts";
import { CommandParser } from "@/renderer/lib/commands/commandParser.ts";
import { CommandPrediction } from "@/renderer/lib/commands/commandPrediction.ts";

/**
 * The final, consolidated result object that is returned to the Terminal component.
 * It contains the text output and flattened arrays of all actions and sound events to be triggered.
 */
export interface ProcessedCommandResult {
  output: string
  actions: CommandAction[]
  soundBlueprint?: SoundBlueprint
}

export interface TerminalSetters {
  setColor: (c: string) => void;
  setPredictions: (p: CommandPrediction) => void
}

/**
 * A class-based command processor for better state management and initialization.
 */
class CommandProcessor {
  // Use a Map for efficient, case-insensitive command lookups.
  private readonly commands: Map<string, CommandDefinition>
  private vars: Record<string, string> = {}

  private setters: TerminalSetters;

  constructor(setters: TerminalSetters) {
    this.setters = setters;

    this.commands = new Map()
    this.loadCommands(coreCommands);
  }

  /**
   * Loads an array of command definitions into the command map.
   * @param commandList An array of objects conforming to the CommandDefinition interface.
   */
  public loadCommands(commandList: CommandDefinition[]): void {
    commandList.forEach((command) => {
      this.commands.set(command.name.toLowerCase(), command)
    })
  }

  /**
   * Parses a raw input string, finds the corresponding command, executes it,
   * and consolidates all static and runtime effects into a single result object.
   * @param input The raw command string from the terminal.
   * @returns A ProcessedCommandResult object for the Terminal to orchestrate.
   */
  public process(input: string): ProcessedCommandResult {
    const trimmedInput = input.trim()
    if (!trimmedInput) {
      return { output: '', actions: [] }
    }

    let {
      variables,
      command: commandName,
      args
    } = CommandParser.parse(input, this.vars)

    this.vars = variables;

    if (commandName.length === 0) {
      return { output: trimmedInput, actions: [] }
    }

    let command: CommandDefinition|undefined;
    if (args.includes('-h')) {
      command = this.commands.get('help');
      args = [commandName, ...args];
    }
    else {
      command = this.commands.get(commandName);
    }

    if (command) {
      // 1. Execute the command's core logic to get the runtime result.
      const runtimeResult: CommandResult = command.execute(args, this.setters)

      // 2. Consolidate static and runtime effects into flattened arrays.
      const allActions: CommandAction[] = [
        ...(command.staticActions ?? []),
        ...(runtimeResult.runtimeActions ?? [])
      ]
      const soundBlueprint = runtimeResult.soundBlueprint ?? command.soundBlueprint

      // 3. Return the final, processed result for the orchestrator.
      return {
        output: runtimeResult.output,
        actions: allActions,
        soundBlueprint
      }
    } else {
      // Handle the case where the command is not found.
      return {
        output: `Command not found: ${commandName}\n` + helpCommand.execute([], this.setters).output,
        actions: [],
        soundBlueprint: {
          sources: [
            { type: 'oscillator', oscillatorType: 'square', frequency: 150 },
            {
              type: 'oscillator',
              oscillatorType: 'square',
              frequency: 150 * Math.pow(1.05946, 6), // Tritone
              detune: 10
            }
          ],
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 },
          duration: 0.5
        }
      }
    }
  }
}

// // Export a singleton instance of the processor.
// const commandProcessor = new CommandProcessor(function(_ctx){})
//
// // Expose the process method directly for ease of use.
// export const processCommand = (input: string): ProcessedCommandResult => {
//   return commandProcessor.process(input)
// }

export default CommandProcessor
