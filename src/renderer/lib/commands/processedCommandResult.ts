import { CommandPrediction } from "@/renderer/lib/commands/commandPrediction.ts";
import { CommandAction } from "@/renderer/definitions/commands/types.ts";
import { SoundBlueprint } from "@/renderer/lib/audio/audioBlueprints.ts";
import { ThemeProviderState } from "@/renderer/lib/contexts/themeProvider.tsx";
import { EffectController } from "@/renderer/lib/text/effectController.tsx";
import { HistoryItem } from "@/renderer/types/terminal.ts";

/**
 * The final, consolidated result object that is returned to the Terminal component.
 * It contains the text output and flattened arrays of all actions and sound events to be triggered.
 */
export interface ProcessedCommandResult {
  output: string;
  actions: CommandAction[];
  soundBlueprint?: SoundBlueprint;
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

  setLatency: (c: boolean) => void;
  setPredictions: (p: string[]) => void;
  setHistory: (c: HistoryItem[]) => void;
}
