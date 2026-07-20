/**
 * @file src/renderer/src/lib/commands/commandProcessor.ts
 * @description A dynamic command processing engine that loads and executes command definitions,
 * combining static and runtime effects into a single result for the orchestrator.
 */

import { CommandAction, CommandDefinition, CommandResult } from "../../definitions/commands/types";
import { coreCommands } from "../../definitions/commands/core";
import {
  askClaude,
  cancelActiveClaudeRequest,
  isChatExitCommand
} from "@/renderer/definitions/commands/core/claude.ts";
import { CommandParser } from "@/renderer/lib/commands/commandParser.ts";
import { audioEngine } from "@/renderer/lib/audio/audioEngine.ts";
import { errorSound } from "@/renderer/lib/audio/sounds/error.ts";
import { keySounds } from "@/renderer/lib/audio/keys/special.ts";
import { CommandContexts, ProcessedCommandResult } from "@/renderer/lib/commands/processedCommandResult.ts";
import React from "react";

/**
 * A class-based command processor for better state management and initialization.
 */
class CommandProcessor {
  // Use a Map for efficient, case-insensitive command lookups.
  private readonly commands: Map<string, CommandDefinition>;
  private vars: Record<string, string> = {};

  contexts: CommandContexts;

  private commandIndex: number = -1;
  private localHistory: string[] = [];

  constructor(contexts: CommandContexts) {

    audioEngine.initialize()

    this.contexts = contexts;

    this.commands = new Map();
    this.loadCommands(coreCommands);
  }

  setLocalHistory(localHistory: string[]) {
    this.localHistory = localHistory;
    this.contexts.localHistory = localHistory;
    this.resetIndex()
  }

  /**
   * Loads an array of command definitions into the command map.
   * @param commandList An array of objects conforming to the CommandDefinition interface.
   */
  public loadCommands(commandList: CommandDefinition[]): void {
    commandList.forEach((command) => {
      this.commands.set(command.name.toLowerCase(), command);
    });
    // Expose the names so commands can introspect without importing the
    // registry (which imports them — that would be a cycle).
    this.contexts.commandNames = [...this.commands.keys()];
  }

  /**
   * Parses a raw input string, finds the corresponding command, executes it,
   * and consolidates all static and runtime effects into a single result object.
   * @param input The raw command string from the terminal.
   * @param providedVars
   * @param depth
   * @returns A ProcessedCommandResult object for the Terminal to orchestrate.
   */
  process(
    input: string,
    providedVars: Record<string, string> = this.vars,
    depth = 0,
    options: { bypassChat?: boolean } = {}
  ): ProcessedCommandResult {
    this.setLocalHistory(this.localHistory.concat([input]));

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return { output: "", actions: [] };
    }

    // In chat mode the input is a message, not a command — route it to Claude
    // before the parser gets a chance to interpret it. This is checked first so
    // a message like "help me" reaches Claude rather than running `help`.
    // `bypassChat` is how Claude's own run_command tool escapes this branch;
    // without it every tool-run command would loop straight back into Claude.
    if (this.contexts.chatMode && !options.bypassChat) {
      if (isChatExitCommand(trimmedInput)) {
        this.contexts.setChatMode?.(false);
        return { output: "Left Claude chat.", actions: [] };
      }

      const result = askClaude(trimmedInput, this.contexts);
      return { output: result.output, actions: [], stream: result.stream };
    }

    let { variables, command: commandName, args } = CommandParser.parse(input, providedVars, this, depth);

    this.vars = variables;

    if (commandName.length === 0) {
      return { output: trimmedInput, actions: [] };
    }

    let command: CommandDefinition | undefined;
    if (args.includes("-h")) {
      command = this.commands.get("help");
      args = [commandName, ...args];
    } else {
      command = this.commands.get(commandName);
    }

    if (command) {
      // 1. Execute the command's core logic to get the runtime result.
      const runtimeResult: CommandResult = command.execute(args, this.contexts);

      // 2. Consolidate static and runtime effects into flattened arrays.
      const allActions: CommandAction[] = [
        ...(command.staticActions ?? []),
        ...(runtimeResult.runtimeActions ?? [])
      ];
      const soundBlueprint = runtimeResult.soundBlueprint ?? command.soundBlueprint;

      // 1. Play the sound blueprint if it exists.
      if (soundBlueprint) {
        audioEngine.playSoundFromBlueprint(soundBlueprint)
      }
      // 3. Return the final, processed result for the orchestrator.
      return {
        output: runtimeResult.output,
        actions: allActions,
        soundBlueprint,
        stream: runtimeResult.stream
      };
    } else {
      // Handle the case where the command is not found.
      // 1. Play the sound blueprint if it exists.
      audioEngine.playSoundFromBlueprint(errorSound)
      return {
        output:
          `Command not found: ${commandName}\n`,
        actions: []
      }
    }
  }

  /**
   * Runs a command on Claude's behalf. Bypasses chat-mode routing (or the
   * command would come straight back to Claude) and refuses to re-enter
   * `claude` itself, which would nest one conversation inside another.
   */
  public runForTool(command: string): ProcessedCommandResult {
    const name = command.trim().split(/\s+/)[0]?.toLowerCase();
    if (name === "claude") {
      return {
        output: "Refused: `claude` cannot invoke itself.",
        actions: []
      };
    }
    return this.process(command, undefined, 0, { bypassChat: true });
  }

  public handleKey(e: React.KeyboardEvent<HTMLInputElement>, setInput: (item: string) => void): void {

    if (e.key !== 'Tab') {
      this.contexts.predictor.reset();
      if (this.contexts.predictions.length > 0) {
        this.contexts.setPredictions([]);
      }
    }
    if (!['ArrowUp', 'ArrowDown'].includes(e.key)) {
      this.resetIndex();
    }

    let newIndex;
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault()
        if (this.localHistory.length === 0) break;
        newIndex = Math.max(this.commandIndex - 1, 0)
        this.commandIndex = newIndex;

        setInput(this.localHistory[newIndex]);
        break;
      case "ArrowDown":
        e.preventDefault()
        if (this.commandIndex === this.localHistory.length - 1) {
          setInput("");
          this.resetIndex();
        }
        else {
          newIndex = Math.min(this.commandIndex + 1, this.localHistory.length)
          this.commandIndex = newIndex;
          setInput(this.localHistory[newIndex]);
        }
        break;
      case "Backspace":
        keySounds.backspace();
        break;
      case "Tab":
        e.preventDefault();
        // Chat input is prose, not commands — completing it against the command
        // list would mangle what the user is typing.
        if (this.contexts.chatMode) break;
        const element = e.target as HTMLInputElement;
        const prediction = this.contexts.predictor.predict(element.value);

        if (Array.isArray(prediction)) {
          this.contexts.setPredictions(prediction);
        }
        else {
          this.contexts.setPredictions([]);
          setInput(prediction)
        }
        break;
      case "C":
      case "c":
        if (e.ctrlKey) {
          e.preventDefault();
          // Interrupt a streaming `claude` reply first, the way Ctrl+C would
          // interrupt any other long-running foreground command.
          cancelActiveClaudeRequest();
          this.resetIndex();
          setInput("");
        }
        break;
    }

    const character = e.key;

    const special = /[^\w\s]/

    const frequency =
      character.match(special) ? 1200
        : (250 + (e.key.charCodeAt(0) * 5) % 800);

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      audioEngine.playSoundFromBlueprint({
        sources: [
          {
            type: 'oscillator',
            oscillatorType: 'triangle',
            frequency
          }
        ],
        envelope: { attack: 0.005, decay: 0.05, sustain: 0.2, release: 0.045 },
        duration: 0.1
      })
    }
  }

  private resetIndex() {
    this.commandIndex = this.localHistory.length;
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
