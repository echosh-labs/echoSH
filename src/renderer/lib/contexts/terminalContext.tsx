import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import CommandProcessor from "@/renderer/lib/commands/commandProcessor.ts";
import { CommandPrediction } from "@/renderer/lib/commands/commandPrediction.ts";
import { coreCommands } from "@/renderer/definitions/commands/core";
import { useTheme } from "@/renderer/lib/contexts/themeProvider.tsx";

export type TerminalContext = {
  processor: CommandProcessor;
  predictions: CommandPrediction;
  arch: string
  latency: boolean;
  setProcessor: (p: CommandProcessor) => void;
  setPredictions: (p: CommandPrediction) => void;
  setArch: (c: string) => void;
  setLatency: (c: boolean) => void;
}

// @ts-expect-error none
const TerminalContext = createContext<TerminalContext>();

export const TerminalContextProvider = ({children}: {children: ReactNode}) => {

  const [arch, setArch]                 = useState<string>("unknown");
  const [latency, setLatency]           = useState<boolean>(false);
  //TODO move history to terminal context
  // const [history, setHistory]           = useState<boolean>(false);

  const theme         = useTheme();
  const [predictions, setPredictions]   = useState<CommandPrediction>(new CommandPrediction(coreCommands));

  const [processor, setProcessor]       = useState<CommandProcessor>(new CommandProcessor({
    theme,
    predictions
  }));

  const value: TerminalContext = {
    processor,
    predictions,
    arch,
    latency,
    setProcessor,
    setPredictions,
    setArch,
    setLatency,
  };

  useEffect(() => {
    window.BRIDGE.onAppInit((data) => {
      console.log("[RENDERER] onAppInit received:", data);
      setArch(data.arch);
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
