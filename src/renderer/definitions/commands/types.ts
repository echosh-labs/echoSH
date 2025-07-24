/**
 * @file src/renderer/src/definitions/commands/types.ts
 * @description Defines the master shared types for a fully extensible command system.
 *
 * This structure is designed to be future-proof, accommodating a complex audio engine
 * with nodes, filters, and effects, and allowing commands to trigger multiple
 * side-effects.
 */

import { SoundBlueprint } from "../../lib/audio/audioBlueprints";

import { CommandContexts } from "@/renderer/lib/commands/processedCommandResult.ts";

//==============================================================================
// Core Effect Types
//==============================================================================

/**
 * Represents a discrete, non-audio side-effect that the Terminal UI can perform.
 * This list can be expanded as new UI capabilities are added.
 */
export type CommandAction = "clearHistory" | "toggleLatencyWidget" | "reboot";

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
  output: string;

  /** An optional array of UI actions to be performed, determined at runtime. */
  runtimeActions?: CommandAction[];

  /** An optional sound blueprint to be triggered, determined at runtime. */
  soundBlueprint?: SoundBlueprint;
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
  readonly name: string;

  /** A brief, user-facing explanation of what the command does. */
  readonly description: string;

  /**
   * The core logic of the command.
   * @param args - An array of string arguments provided by the user after the command name.
   * @returns A `CommandResult` object containing the output and any dynamic effects.
   */
  execute: (args: string[], contexts: CommandContexts) => CommandResult;

  /**
   * An optional array of UI actions that are *always* performed when this command is run.
   * Useful for commands with fixed, predictable side-effects (e.g., 'clear' always clears history).
   */
  readonly staticActions?: readonly CommandAction[];

  /**
   * An optional sound blueprint that is *always* triggered when this command is run.
   * This defines the default auditory feedback for the command.
   */
  readonly soundBlueprint?: SoundBlueprint;

  readonly argSet: CommandArg[];
}

export type CommandArg =
  | {
      args?: CommandArg[];
      flag?: string;
      literal?: string;
      placeholder?: string;
      description?: string;
      required?: boolean;
      getSuggestions?: (currentArg: string) => string[] | Promise<string[]>;
    }
  | string;
