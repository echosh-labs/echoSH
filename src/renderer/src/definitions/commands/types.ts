/**
 * @file src/renderer/src/definitions/commands/types.ts
 * @description Defines the shared types for command definitions and processing results.
 */

// Actions that the Terminal component can perform.
export type CommandAction = 'clearHistory' | 'toggleLatencyWidget'

// Sound events that the AudioEngine can play.
export type SoundEffect = 'error' | 'command' | 'none'

/**
 * The data structure that defines a command's properties and behavior.
 */
export interface CommandDefinition {
  // The string that invokes the command.
  name: string
  // A brief explanation of what the command does.
  description: string
  // An optional side-effect for the terminal UI to perform.
  action?: CommandAction
  // The sound event to trigger when the command is run.
  soundEffect: SoundEffect
  // The function that generates the text output for the terminal.
  execute: (args: string[]) => string
}

/**
 * The object returned by the command processor after processing input.
 */
export interface CommandResult {
  output: string
  action?: CommandAction
  soundEffect?: SoundEffect
}
