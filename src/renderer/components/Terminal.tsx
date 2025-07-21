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
  output: string
}

interface TerminalProps {
  onToggleLatencyWidget: () => void
}

export const Terminal: React.FC<TerminalProps> = ({ onToggleLatencyWidget }) => {
  const [input, setInput] = useState<string>('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const outputContainerRef = useRef<HTMLDivElement>(null);
  const [predictions, setPredictions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)


  const commandPrediction = useMemo(() => {
    return new CommandPrediction(coreCommands);
  }, []);

  // Load command history from persistent storage on initial render.
  useEffect(() => {
    loadHistory().then((storedHistory) => {
      setCommandHistory(storedHistory)
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
    if (!isInitialized) {
      audioEngine.initialize()
      setIsInitialized(true)
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
    if (isInitialized && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {

      const character = e.key;

      const special = /[^\w\s]/

      const frequency =
        character.match(special) ? 1200
        : (250 + (e.key.charCodeAt(0) * 5) % 800);

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

  // Main handler for command submission.
  const handleCommandSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const command = input.trim()
    if (!command) return

    // Update and save command history.
    const newCommandHistory = [
      command,
      ...commandHistory.filter((c) => c !== command)
    ]
    setCommandHistory(newCommandHistory)
    // localStorage update is handled by useEffect
    setHistoryIndex(-1)

    // Ensure audio engine is initialized before processing.
    if (!isInitialized) {
      setHistory([
        ...history,
        {
          id: history.length,
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
          setHistory([])
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
      setHistory([...history, newHistoryItem])
    }

    setInput('')
  }

  return (
    <div className="terminal-container" onClick={handleTerminalClick}>
      <div className="output-area" ref={outputContainerRef}>
        {history.map((item) => (
          <div key={item.id} className="p-2 pt-0">
            <div className="flex">
              <span className="text-prompt mr-2">$</span>
              <span>{item.command}</span>
            </div>
            <div className="text-output">{item.output}</div>
          </div>
        ))}
        {!isInitialized && (
          <div className="text-warning p-2 animate-pulse">
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
        <form onSubmit={handleCommandSubmit}>
          <div className="flex">
            <span className="text-prompt mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="terminal-input"
              autoComplete="off"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
