/**
 * @file src/renderer/src/components/Terminal.tsx
 * @description The main user interface component. It orchestrates user input,
 * command processing, and audio feedback.
 */

import React, { useState, useRef, useEffect, KeyboardEvent, useMemo } from "react";
import { audioEngine } from '../lib/audio/audioEngine'
import {
  processCommand,
  ProcessedCommandResult
} from '../lib/commands/commandProcessor'
import { CommandAction } from '../definitions/commands/types'
import { loadHistory, saveHistory } from '../lib/commands/historyStorage'
import { keySounds } from "@/renderer/definitions/keys/special.ts";
import { CommandPrediction } from "@/renderer/lib/commands/commandPrediction.ts";
import { coreCommands } from "@/renderer/definitions/commands/core";

interface HistoryItem {
  id: number
  command: string
  output: React.ReactNode
}

interface TerminalProps {
  onToggleLatencyWidget: () => void
}

export const Terminal: React.FC<TerminalProps> = ({ onToggleLatencyWidget }) => {
  const [input, setInput] = useState<string>('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [predictions, setPredictions] = useState<string[]>([])
  const [isAudioInitialized, setIsAudioInitialized] = useState<boolean>(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true)
  const [terminalColorClass, setTerminalColorClass] = useState<string>(
    'text-cyan-400'
  )
  const outputContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const commandPrediction = useMemo(() => {
    return new CommandPrediction(coreCommands);
  }, []);

  // Load command history from persistent storage on initial render.
  useEffect(() => {
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
    if (!isAudioInitialized) {
      audioEngine.initialize()
      setIsAudioInitialized(true)
    }
    inputRef.current?.focus()
  }

  // Handles keyboard input for keystroke sounds and command history navigation.
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
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
    help: () => {
      const commands = [
        { cmd: 'help', desc: 'Displays this list of available commands.' },
        { cmd: 'theme', desc: 'Displays the application color palette.' },
        { cmd: 'color:list', desc: 'Lists available output text colors.' },
        { cmd: 'color:<name>', desc: 'Sets the output text color (e.g., color:red).' },
        { cmd: 'clear', desc: 'Clears the output history from the terminal view.' },
        { cmd: 'test:error', desc: 'Triggers the custom error sound for testing.' },
        { cmd: 'toggle:latency', desc: 'Shows or hides the audio latency diagnostic widget.' }
      ]

      const helpOutput = (
        <div className="mt-1">
          <p className="mb-2">Available commands:</p>
          {commands.map(({ cmd, desc }) => (
            <div key={cmd} className="flex">
              <span className="w-40 flex-shrink-0 text-foreground">{cmd}</span>
              <span className="text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      )

      setHistory((prev) => [...prev, { id: prev.length, command: 'help', output: helpOutput }])
    },
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
    },
    color: (arg: string) => {
      const newColor = arg.trim()
      const validColors: { [key: string]: string } = {
        default: 'text-cyan-400',
        white: 'text-foreground',
        cyan: 'text-cyan-400',
        green: 'text-green-400',
        yellow: 'text-yellow-400',
        red: 'text-red-400' // Using a standard red for better visibility
      }

      let outputMessage = ''

      if (newColor === 'list') {
        outputMessage = `Available colors: ${Object.keys(validColors).join(', ')}`
      } else if (validColors[newColor]) {
        setTerminalColorClass(validColors[newColor])
        outputMessage = `Terminal color set to ${newColor}.`
      } else {
        outputMessage = `Error: Invalid color '${newColor}'. Use 'color:list' to see available colors.`
      }

      const command = `color:${newColor}`
      setHistory(prev => [...prev, { id: prev.length, command, output: outputMessage }])
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
    const result: ProcessedCommandResult = processCommand(command)

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
          onToggleLatencyWidget()
          break
      }
    })

    // 3. Update the output history if it wasn't cleared.
    if (!result.actions.includes('clearHistory') && result.output) {
      const newHistoryItem: HistoryItem = {
        id: history.length,
        command: command,
        output: result.output
      }
      setHistory(prev => [...prev, { ...newHistoryItem, id: prev.length }])
    }

    setInput('')
  }

  return (
    <div className={`flex h-screen flex-col bg-background font-mono text-sm text-foreground ${terminalColorClass}`} onClick={handleTerminalClick}>
      <div className="flex-grow overflow-y-auto p-4" ref={outputContainerRef}>
        <div>Sirocco v0.2.0 - Click to start audio.</div>
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

      <div className="input-area p-2">
        {predictions.length > 0 && (
          <div className="cmd-predictions text-output">
            {predictions.join(', ')}
          </div>
        )}
      </div>
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
