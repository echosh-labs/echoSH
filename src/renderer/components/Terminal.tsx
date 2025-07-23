/**
 * @file src/renderer/src/components/Terminal.tsx
 * @description The main user interface component. It orchestrates user input,
 * command processing, and audio feedback.
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { audioEngine } from '../lib/audio/audioEngine'
import {
  ProcessedCommandResult
} from '../lib/commands/commandProcessor'
import { CommandAction } from '../definitions/commands/types'
import { loadHistory, saveHistory } from '../lib/commands/historyStorage'
import { keySounds } from "@/renderer/lib/audio/keys/special.ts";
import { useTerminalContext } from "@/renderer/lib/contexts/terminalContext.tsx";

interface HistoryItem {
  id: number
  command: React.ReactNode
  output: React.ReactNode
}

export const Terminal = () => {

  const terminalContext = useTerminalContext();

  const [input, setInput] = useState<string>('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [predictions, setPredictions] = useState<string[]>([])
  const [isAudioInitialized, setIsAudioInitialized] = useState<boolean>(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true)
  const outputContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const commandPrediction = terminalContext.predictions;
  const commandProcessor = terminalContext.processor;

  // Load command history from persistent storage on initial render.
  // Also, init application
  useEffect(() => {
    if (!isAudioInitialized) {
      audioEngine.initialize()
      setIsAudioInitialized(true)
    }
    loadHistory().then((storedHistory) => {
      setCommandHistory(storedHistory)
      setIsLoadingHistory(false)
    })
  }, [])

  // Save command history to persistent storage whenever it changes.
  useEffect(() => {
    saveHistory(commandHistory)
  }, [commandHistory])

  // Auto-scroll to the bottom of the output area when history changes.
  useEffect(() => {
    if (outputContainerRef.current) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight
    }
  }, [history])

  // Handles the first user interaction to initialize the AudioContext.
  const handleTerminalClick = (): void => {
    // inputRef.current?.focus()
  }

  // Handles keyboard input for keystroke sounds and command history navigation.
  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>): Promise<void> => {
    if (e.key !== 'Tab') {
      commandPrediction.reset();
      if (predictions.length > 0) {
        setPredictions([]);
      }
    }

      const character = e.key;

      const special = /[^\w\s]/

      const frequency =
        character.match(special) ? 1200
        : (250 + (e.key.charCodeAt(0) * 5) % 800);

    if (isAudioInitialized && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      audioEngine.playKeystroke(frequency);
    }

    let newIndex;
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault()
        if (commandHistory.length === 0) break;
        newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex]);
        break;
      case "ArrowDown":
        e.preventDefault()
        newIndex = Math.max(historyIndex - 1, -1)
        setHistoryIndex(newIndex)
        setInput(newIndex === -1 ? '' : commandHistory[newIndex]);
        break;
      case "Backspace":
        keySounds.backspace();
        break;
      case "Tab":
        e.preventDefault();
        const prediction = commandPrediction.predict(input);

        if (Array.isArray(prediction)) {
          setPredictions(prediction);
        }
        else {
          setPredictions([]);
          setInput(prediction)
        }
        break;
    }
  }

  const internalCommands: { [key: string]: (arg: string) => void } = {
    theme: () => {

      const themeColors: { [key: string]: string } = {
        background: 'bg-background',
        foreground: 'bg-foreground',
        card: 'bg-card',
        'card-foreground': 'bg-card-foreground',
        popover: 'bg-popover',
        'popover-foreground': 'bg-popover-foreground',
        primary: 'bg-primary',
        'primary-foreground': 'bg-primary-foreground',
        secondary: 'bg-secondary',
        'secondary-foreground': 'bg-secondary-foreground',
        muted: 'bg-muted',
        'muted-foreground': 'bg-muted-foreground',
        accent: 'bg-accent',
        'accent-foreground': 'bg-accent-foreground',
        destructive: 'bg-destructive',
        'destructive-foreground': 'bg-destructive-foreground',
        border: 'bg-border',
        input: 'bg-input',
        ring: 'bg-ring'
      }


      const themeOutput = (
        <div className="mt-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-3">
            {Object.entries(themeColors).map(([name, className]) => (
              <div key={name} className="flex items-center">
                <div className={`h-4 w-4 rounded-sm border border-border ${className} mr-2`}></div>
                <span className="text-sm">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )
      setHistory(prev => [...prev, { id: prev.length, command: 'theme', output: themeOutput }])
    }
  }

  // Main handler for command submission.
  const handleCommandSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const command = input.trim()
    if (!command) return

    // Check for internal commands first
    const [cmd, ...args] = command.split(':')
    if (internalCommands[cmd]) {
      internalCommands[cmd](args.join(':'))
      setInput('')
      setHistoryIndex(-1)
      return
    }

    // Update and save command history.
    setCommandHistory((prevCommandHistory) => {
      const updatedHistory = [
        command,
        ...prevCommandHistory.filter((c) => c !== command)
      ]
      return updatedHistory.slice(0, 50) // Keep history to a reasonable length
    })
    setHistoryIndex(-1)

    // Ensure audio engine is initialized before processing.
    if (!isAudioInitialized) {
      setHistory(prev => [
        ...prev,
        {
          id: prev.length,
          command: command,
          output:
            'Please click on the terminal to initialize the audio engine first.'
        }
      ])
      setInput('')
      return
    }

    // Process the command and get the consolidated result.
    const result: ProcessedCommandResult = commandProcessor.process(command);

    // --- Orchestrate Side Effects ---

    // 1. Play the sound blueprint if it exists.
    if (result.soundBlueprint) {
      audioEngine.playSoundFromBlueprint(result.soundBlueprint)
    }

    // 2. Iterate through and execute all UI actions.
    result.actions.forEach((action: CommandAction) => {
      switch (action) {
        case 'clearHistory':
          setHistory(() => [])
          break
        case 'toggleLatencyWidget':
          terminalContext.setLatency(!terminalContext.latency)
          break
      }
    })




    // 3. Update the output history if it wasn't cleared.
    if (!result.actions.includes('clearHistory') && result.output) {

      Promise.all([
        terminalContext.effects.process(command),
        terminalContext.effects.process(result.output)
      ]).then(([command, output]) => {

          const newHistoryItem: HistoryItem = {
            id: history.length,
            command: command,
            output: output
          }
          setHistory(prev => [...prev, { ...newHistoryItem, id: prev.length }])
        })


    }

    setInput('')
  }

  return (
    <div
      style={{height: 'calc(100vh - 54px)'}}
      className={`flex flex-col bg-background text-sm`} onClick={handleTerminalClick}>
      <div className="flex-grow overflow-y-auto p-4 output-area" ref={outputContainerRef}>
        {isLoadingHistory && <div className="animate-pulse">Loading history...</div>}
        {history.map((item) => (
          <div key={item.id} className="mb-2">
            <div className="flex">
              <span className="mr-2">$</span>
              <span className="flex-shrink-1">{item.command}</span>
            </div>
            <div className="whitespace-pre-wrap">{item.output}</div>
          </div>
        ))}
        {!isAudioInitialized && (
          <div className="animate-pulse">
            Waiting for user interaction to initialize Audio Engine...
          </div>
        )}
      </div>

        {predictions.length > 0 && (
          <div className="input-area p-2">
            <div className="cmd-predictions text-output">
              {predictions.join(', ')}
            </div>
          </div>
        )}
      <div className="border-t border-border p-4">
        <form onSubmit={handleCommandSubmit}>
          <div className="flex items-center">
            <span className="mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border-none bg-transparent p-0 caret-primary focus:outline-none focus:ring-0"
              disabled={isLoadingHistory} // Disable input while history is loading
              autoComplete="off"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
