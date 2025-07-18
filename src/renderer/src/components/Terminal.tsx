/**
 * @file Terminal.tsx
 * @description The main user interface component. It orchestrates user input,
 * command processing, and audio feedback.
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { audioEngine } from '../lib/audio/audioEngine'
import {
  processCommand,
  ProcessedCommandResult
} from '../lib/commands/commandProcessor'
import { CommandAction, SoundEvent } from '../definitions/commands/types'

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
  const outputContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load command history from the main process on initial render.
  useEffect(() => {
    window.electron.ipcRenderer.invoke('history:load').then((loadedHistory) => {
      setCommandHistory(loadedHistory)
    })
  }, [])

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
    if (isInitialized && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      audioEngine.playKeystrokeSound(e.key)
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
      if (newIndex >= 0) {
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(newIndex)
      if (newIndex === -1) {
        setInput('')
      } else {
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
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
    window.electron.ipcRenderer.send('history:save', newCommandHistory)
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

    // 1. Iterate through and trigger all sound events.
    result.soundEvents.forEach((event: SoundEvent) => {
      // This is a temporary mapping. The future ThemeManager will handle this.
      switch (event) {
        case 'commandSuccess':
          audioEngine.generateCommandSound(command)
          break
        case 'invalidCommand':
          audioEngine.playErrorSound()
          break
        case 'none':
        default:
          break // Do nothing for silent events.
      }
    })

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
        <div className="p-2">Sirocco v0.2.0 - Click to start audio.</div>
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
