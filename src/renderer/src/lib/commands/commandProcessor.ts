// src/renderer/src/lib/commandProcessor.ts

/**
 * @file commandProcessor.ts
 * @description Handles parsing and execution of terminal commands.
 */

export type CommandAction = 'clearHistory' | 'toggleLatencyWidget'
export type SoundEffect = 'error' | 'command' | 'none'

export interface CommandResult {
  output: string
  action?: CommandAction
  soundEffect?: SoundEffect // Explicitly define the sound to be played
}

/**
 * Processes a given command string and returns the result.
 * @param command The raw command string from the terminal input.
 * @returns A CommandResult object with the output and any special actions.
 */
export function processCommand(command: string): CommandResult {
  const trimmedCommand = command.trim().toLowerCase()

  switch (trimmedCommand) {
    case 'clear':
      return {
        output: '',
        action: 'clearHistory',
        soundEffect: 'none'
      }

    case 'help':
      return {
        output: 'Available commands: clear, help, test:error, toggle:latency',
        soundEffect: 'command'
      }

    case 'test:error':
      return {
        output: 'Error: This is a test error.',
        soundEffect: 'error'
      }

    case 'toggle:latency':
      return {
        output: 'Toggling audio latency widget...',
        action: 'toggleLatencyWidget',
        soundEffect: 'command'
      }

    default:
      return {
        output: `Executing: ${command}`,
        soundEffect: 'command'
      }
  }
}