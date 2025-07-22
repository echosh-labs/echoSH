import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import CommandProcessor from "@/renderer/lib/commands/commandProcessor.ts";
import { CommandPrediction } from "@/renderer/lib/commands/commandPrediction.ts";
import { coreCommands } from "@/renderer/definitions/commands/core";

export type TerminalContext = {
  processor: CommandProcessor;
  predictions: CommandPrediction;
  color: string;
  arch: string
  setProcessor: (p: CommandProcessor) => void;
  setPredictions: (p: CommandPrediction) => void;
  setColor: (c: string) => void;
  setArch: (c: string) => void;
}

// @ts-expect-error none
const TerminalContext = createContext<TerminalContext>();

export const TerminalContextProvider = ({children}: {children: ReactNode}) => {

  const [color, setColor]               = useState<string>('text-cyan-400');
  const [arch, setArch]                 = useState<string>("unknown");
  const [predictions, setPredictions]   = useState<CommandPrediction>(new CommandPrediction(coreCommands));
  const [processor, setProcessor]       = useState<CommandProcessor>(new CommandProcessor({
    setColor,
    setPredictions
  }));

  const value: TerminalContext = {
    processor,
    predictions,
    color,
    arch,
    setProcessor,
    setPredictions,
    setColor,
    setArch
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
