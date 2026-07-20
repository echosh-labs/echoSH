import { CommandPrediction } from "@/renderer/lib/commands/commandPrediction.ts";
import { CommandAction } from "@/renderer/definitions/commands/types.ts";
import { SoundBlueprint } from "@/renderer/lib/audio/audioBlueprints.ts";
import { ThemeProviderState } from "@/renderer/lib/contexts/themeProvider.tsx";
import { EffectController } from "@/renderer/lib/text/effectController.tsx";
import { HistoryItem } from "@/renderer/types/terminal.ts";
import { CommandReference } from "@/renderer/types/claude.ts";

/**
 * The final, consolidated result object that is returned to the Terminal component.
 * It contains the text output and flattened arrays of all actions and sound events to be triggered.
 */
export interface ProcessedCommandResult {
  output: string;
  actions: CommandAction[];
  soundBlueprint?: SoundBlueprint;
  /** See `CommandResult.stream` — the terminal wires this up after appending. */
  stream?: (emit: (text: string) => void) => void;
}

export interface TerminalSetters {
  setColor: (c: string) => void;
  setPredictions: (p: CommandPrediction) => void;
}

export interface CommandContexts {
  theme: ThemeProviderState;
  predictor: CommandPrediction;
  latency: boolean;
  effects: EffectController;
  predictions: string[];
  history: HistoryItem[];
  localHistory?: string[];
  /**
   * Every loaded command with its signature. Supplied by the processor so
   * commands can introspect the command set without importing the registry
   * they live in.
   */
  commandReference?: CommandReference[];
  /**
   * When true, bare terminal input is sent to Claude instead of being parsed as
   * a command. Entered by `claude`, left with `exit`.
   */
  chatMode?: boolean;
  setChatMode?: (on: boolean) => void;
  arch?: string;
  version?: string;
  /** The most recent blueprint produced by `random`/`raw`, so `save` can persist it. */
  lastBlueprint?: SoundBlueprint;

  setLatency: (c: boolean) => void;
  setPredictions: (p: string[]) => void;
  setHistory: (c: HistoryItem[]) => void;
}
