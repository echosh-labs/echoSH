import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import CommandProcessor from "@/renderer/lib/commands/commandProcessor.ts";
import { CommandPrediction } from "@/renderer/lib/commands/commandPrediction.ts";
import { coreCommands } from "@/renderer/definitions/commands/core";
import { useTheme } from "@/renderer/lib/contexts/themeProvider.tsx";
import { EffectController } from "@/renderer/lib/text/effectController.tsx";
import { HistoryItem } from "@/renderer/types/terminal.ts";
import { ProcessedCommandResult } from "@/renderer/lib/commands/processedCommandResult.ts";
import { AppSettings } from "@/renderer/types/app.ts";

export type TerminalContext = {
  version: string;
  predictor: CommandPrediction;
  arch: string;
  latency: boolean;
  effects: EffectController;
  predictions: string[];
  history: HistoryItem[];
  settings: Partial<AppSettings>;

  setArch: (c: string) => void;
  setLatency: (c: boolean) => void;
  setPredictions: (c: string[]) => void;
  setHistory: (c: HistoryItem[]) => void;

  handleKey: (e: React.KeyboardEvent<HTMLInputElement>, setInput: (text: string) => void) => void;
  execute: (text: string) => ProcessedCommandResult;
};

// @ts-expect-error none
const TerminalContext = createContext<TerminalContext>();

export const TerminalContextProvider = ({ children }: { children: ReactNode }) => {
  const [version, setVersion] = useState<string>("0.0.0");
  const [arch, setArch] = useState<string>("unknown");
  const [latency, setLatency] = useState<boolean>(false);
  const [history, _setHistory] = useState<HistoryItem[]>([]);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [settings, setSettings] = useState<Partial<AppSettings>>({});

  const theme = useTheme();

  const effects = useMemo<EffectController>(() => new EffectController(), []);
  const predictor = useMemo<CommandPrediction>(() => new CommandPrediction(coreCommands), []);

  const processor = useRef<CommandProcessor>(
    new CommandProcessor({
      theme,
      predictor,
      latency,
      effects,
      predictions,
      history,

      setLatency,
      setPredictions,
      setHistory: _setHistory
    })
  );

  function setHistory(history: HistoryItem[]) {
    _setHistory(history);
    processor.current.contexts.history = history;
  }

  const value: TerminalContext = {
    version,
    predictor,
    arch,
    latency,
    effects,
    predictions,
    history,
    settings,

    setArch,
    setLatency,
    setPredictions,
    setHistory,

    handleKey: (e, setInput) => {
      processor.current.handleKey(e, setInput);
    },
    execute: (command) => {
      const result = processor.current.process(command);
      const oldHistory = history.slice(-999);
      const newHistory = oldHistory
        .slice(-999)
        .concat([
          {
            id: oldHistory.length,
            command: command,
            output: result.output,
            cleared: command === "clear"
          }
        ]);
      setHistory(newHistory);
      return result;
    }
  };

  useEffect(() => {
    if (history.length) {
      window.BRIDGE.saveHistory(history);
    }
  }, [history]);

  useEffect(() => {
    window.BRIDGE.onAppInit((data) => {
      setVersion(data.version);
      setArch(data.arch);
      if (data.history) {
        setHistory(data.history);
        processor.current.setLocalHistory(data.history.map((h) => h.command));
      }
      setSettings(data.settings);
    });
    window.BRIDGE.requestAppInit();
    return () => {
      window.BRIDGE.removeAppInitHandler();
    };
  }, []);

  return <TerminalContext.Provider value={value}>{children}</TerminalContext.Provider>;
};

export function useTerminalContext() {
  return useContext(TerminalContext);
}
