/**
 * @file types.ts
 * @description Defines the master shared types for a fully extensible command system.
 *
 * This structure is designed to be future-proof, accommodating a complex audio engine
 * with nodes, filters, and effects, and allowing commands to trigger multiple
 * side-effects.
 */

//==============================================================================
// Core Effect Types
//==============================================================================

/**
 * Represents a discrete, non-audio side-effect that the Terminal UI can perform.
 * This list can be expanded as new UI capabilities are added.
 */
export type CommandAction = 'clearHistory' | 'toggleLatencyWidget' | 'reboot'

/**
 * Represents an abstract sound trigger event.
 *
 * This is the crucial layer of abstraction. The command system does not know *what*
 * a sound is; it only knows *when* to trigger one. The `ThemeManager` will be
 * responsible for mapping these events to specific `SoundBlueprint` objects that the
 * `AudioEngine` can play.
 */
export type SoundEvent =
  | 'commandSuccess'
  | 'commandFailure'
  | 'invalidCommand'
  | 'uiInteraction'
  | 'systemAlert'
  | 'ambient'
  | 'none'

//==============================================================================
// Command Execution Result
//==============================================================================

/**
 * The standardized object returned by a command's `execute` function.
 * This allows a command's outcome to be determined dynamically at runtime.
 * For example, a command could succeed or fail, triggering different sounds
 * and text output based on its internal logic.
 */
export interface CommandResult {
  /** The primary text output to be displayed in the terminal. */
  output: string

  /** An optional array of UI actions to be performed, determined at runtime. */
  runtimeActions?: CommandAction[]

  /** An optional array of sound events to be triggered, determined at runtime. */
  runtimeSoundEvents?: SoundEvent[]
}

//==============================================================================
// Static Command Definition
//==============================================================================

/**
 * The master data structure that statically defines a command's properties and behavior.
 * This interface is the blueprint for every command file stored in the `definitions` directory.
 */
export interface CommandDefinition {
  /** The unique string that invokes the command (e.g., 'help', 'ls'). */
  readonly name: string

  /** A brief, user-facing explanation of what the command does. */
  readonly description: string

  /**
   * The core logic of the command.
   * @param args - An array of string arguments provided by the user after the command name.
   * @returns A `CommandResult` object containing the output and any dynamic effects.
   */
  execute: (args: string[]) => CommandResult

  /**
   * An optional array of UI actions that are *always* performed when this command is run.
   * Useful for commands with fixed, predictable side-effects (e.g., 'clear' always clears history).
   */
  readonly staticActions?: readonly CommandAction[]

  /**
   * An optional array of sound events that are *always* triggered when this command is run.
   * This defines the default auditory feedback for the command.
   */
  readonly staticSoundEvents?: readonly SoundEvent[]
}
