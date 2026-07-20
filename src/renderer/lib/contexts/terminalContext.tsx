import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import CommandProcessor from "@/renderer/lib/commands/commandProcessor.ts";
import { CommandPrediction } from "@/renderer/lib/commands/commandPrediction.ts";
import { coreCommands } from "@/renderer/definitions/commands/core";
import { useTheme } from "@/renderer/lib/contexts/themeProvider.tsx";
import { EffectController } from "@/renderer/lib/text/effectController.tsx";
import { HistoryItem } from "@/renderer/types/terminal.ts";
import { ProcessedCommandResult } from "@/renderer/lib/commands/processedCommandResult.ts";
import { AppSettings } from "@/renderer/types/app.ts";
import { applyStyleSettings } from "@/renderer/lib/styleSettings.ts";
import { runClaudeTool } from "@/renderer/lib/commands/claudeTools.ts";


export type TerminalContext = {
  version: string;
  predictor: CommandPrediction;
  arch: string;
  latency: boolean;
  effects: EffectController;
  predictions: string[];
  history: HistoryItem[];
  settings: Partial<AppSettings>;
  /** True while the terminal is routing input to Claude instead of commands. */
  chatMode: boolean;

  setArch: (c: string) => void;
  setLatency: (c: boolean) => void;
  setPredictions: (c: string[]) => void;
  setHistory: (c: HistoryItem[]) => void;
  setSettings: (s: Partial<AppSettings>) => void;

  handleKey: (e: React.KeyboardEvent<HTMLInputElement>, setInput: (text: string) => void) => void;
  execute: (text: string) => ProcessedCommandResult;
}

// @ts-expect-error none
const TerminalContext = createContext<TerminalContext>();

export const TerminalContextProvider = ({children}: {children: ReactNode}) => {

  const [version, setVersion]           = useState<string>("0.0.0");
  const [arch, setArch]                 = useState<string>("unknown");
  const [latency, setLatency]           = useState<boolean>(false);
  const [history, _setHistory]          = useState<HistoryItem[]>([]);
  const [predictions, setPredictions]   = useState<string[]>([]);
  const [settings, setSettings]         = useState<Partial<AppSettings>>({})
  const [chatMode, _setChatMode]        = useState<boolean>(false);

  const theme          = useTheme();

  const effects   = useMemo<EffectController>(() =>
    new EffectController(),
  []);
  const predictor = useMemo<CommandPrediction>(() =>
    new CommandPrediction(coreCommands),
  []);

  const processor = useRef<CommandProcessor>(
    new CommandProcessor({
      theme,
      predictor,
      latency,
      effects,
      predictions,
      history,
      arch,
      version,

      chatMode,

      setLatency,
      setPredictions,
      setHistory: _setHistory,
      setChatMode,
    })
  );

  /**
   * Chat mode is read by the processor (plain object) and rendered by React
   * (state), so both have to be updated together — the processor reads
   * `contexts.chatMode` synchronously on the very next keystroke.
   */
  function setChatMode(on: boolean) {
    _setChatMode(on);
    processor.current.contexts.chatMode = on;
  }

  function setHistory(history: HistoryItem[]) {
    _setHistory(history);
    processor.current.contexts.history = history;
  }

  /**
   * Replaces the output of a single history entry. Streaming commands emit into
   * this long after `execute` returned, so it takes the functional form of
   * setState — the `history` captured in that closure is stale by then.
   */
  function patchOutput(id: number, output: string) {
    _setHistory((previous) => {
      const next = previous.map((item) =>
        item.id === id ? { ...item, output } : item
      );
      processor.current.contexts.history = next;
      return next;
    });
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
    chatMode,

    setArch,
    setLatency,
    setPredictions,
    setHistory,
    setSettings,

    handleKey: (e, setInput) => {
      processor.current.handleKey(e, setInput);
    },
    execute: (command) => {
      // Captured before `process`, which can toggle chat mode: `claude` turns it
      // on and `exit` turns it off, and each of those lines should be labelled
      // with the prompt it was actually typed at, not the one it produced.
      const prompt = processor.current.contexts.chatMode ? "claude>" : "$";

      const result = processor.current.process(command);
      const oldHistory = history.slice(-999);
      // Derive a monotonically increasing id from the last entry. Using
      // `oldHistory.length` would collide once the history is capped at 999,
      // producing duplicate React keys and reconciliation glitches.
      const nextId = oldHistory.length ? oldHistory[oldHistory.length - 1].id + 1 : 0;
      const newHistory = oldHistory.concat([
        { id: nextId, command: command, output: result.output, cleared: command === "clear", prompt }
      ])
      setHistory(newHistory);

      // Streaming commands (e.g. `claude`) rendered a placeholder above; now
      // that the entry exists, hand them a sink that rewrites it in place.
      result.stream?.((text) => patchOutput(nextId, text));

      return result;
    }
  };

  // Claude's tools run here, not in main, because the audio engine and the
  // command processor both live in the renderer. Registered once — the handler
  // reads the processor through a ref, so it never goes stale.
  useEffect(() => {
    return window.BRIDGE.onClaudeToolCall(async (call) => {
      const outcome = runClaudeTool(call, processor.current);
      return {
        content: outcome.content,
        isError: outcome.isError,
        transcript: outcome.transcript,
      };
    });
  }, []);

  // Debounced so streaming commands don't hit the disk once per token — a
  // `claude` reply changes `history` on every chunk, and each save is an IPC
  // round-trip plus an electron-settings write.
  useEffect(() => {
    if (!history.length) return;
    const timer = setTimeout(() => window.BRIDGE.saveHistory(history), 500);
    return () => clearTimeout(timer);
  }, [history]);

  // Apply the appearance settings to the liquid-glass CSS variables whenever
  // they change (initial load, app:init, or after a save).
  useEffect(() => {
    applyStyleSettings(settings);
  }, [settings]);

  useEffect(() => {
    window.BRIDGE.onAppInit((data) => {
      setVersion(data.version);
      setArch(data.arch);
      // Keep the processor's contexts in sync so commands like `whoami` see them.
      processor.current.contexts.version = data.version;
      processor.current.contexts.arch = data.arch;
      if (data.history) {
        setHistory(data.history);
        processor.current.setLocalHistory(data.history.map(h => h.command));
      }
      setSettings(data.settings);
    });
    window.BRIDGE.requestAppInit();
    return () => {
      window.BRIDGE.removeAppInitHandler();
    };
  }, []);


  return (
    <TerminalContext.Provider value={value}>{children}</TerminalContext.Provider>
  )
}

export function useTerminalContext() {
  return useContext(TerminalContext);
}
