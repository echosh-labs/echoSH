// src/renderer/src/lib/commandProcessor.ts

/**
 * @file commandProcessor.ts
 * @description Handles parsing and execution of terminal commands.
 */

// Exporting the action types makes them reusable and more explicit.
export type CommandAction = 'clearHistory' | 'toggleLatencyWidget'

export interface CommandResult {
  output: string
  action?: CommandAction
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
        output: '', // No output is needed since the screen will be cleared.
        action: 'clearHistory'
      }

    case 'help':
      return {
        output: 'Available commands: clear, help, test:error, toggle:latency'
      }

    case 'test:error':
      return {
        output: 'Error: This is a test error.'
      }

    case 'toggle:latency':
      return {
        output: 'Toggling audio latency widget...',
        action: 'toggleLatencyWidget'
      }

    default:
      return {
        output: `Executing: ${command}`
      }
  }
}
