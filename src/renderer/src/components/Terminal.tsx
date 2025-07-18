// src/renderer/src/components/Terminal.tsx

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { audioEngine } from '../lib/audioEngine'
import { processCommand } from '../lib/commandProcessor'

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

  // Load command history on initial render
  useEffect(() => {
    window.electron.ipcRenderer.invoke('history:load').then((loadedHistory) => {
      setCommandHistory(loadedHistory)
    })
  }, [])

  // Auto-scroll to the bottom when output history changes
  useEffect(() => {
    if (outputContainerRef.current) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight
    }
  }, [history])

  const handleTerminalClick = (): void => {
    if (!isInitialized) {
      audioEngine.initialize()
      setIsInitialized(true)
    }
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (isInitialized && e.key.length === 1) {
      audioEngine.playKeystrokeSound(e.key)
    }

    // Handle command history navigation
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

  const handleCommandSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const command = input.trim()
    if (!command) return

    // Update persistent command history
    const newCommandHistory = [command, ...commandHistory.filter((c) => c !== command)]
    setCommandHistory(newCommandHistory)
    window.electron.ipcRenderer.send('history:save', newCommandHistory)
    setHistoryIndex(-1) // Reset history navigation index

    if (!isInitialized) {
      const newHistoryItem: HistoryItem = {
        id: history.length,
        command: command,
        output: 'Please click on the terminal to initialize the audio engine first.'
      }
      setHistory([...history, newHistoryItem])
      setInput('')
      return
    }

    const result = processCommand(command)

    if (command.toLowerCase() === 'test:error') {
      audioEngine.playErrorSound()
    } else {
      audioEngine.generateCommandSound(command)
    }

    if (result.action === 'clearHistory') {
      setHistory([])
    } else if (result.action === 'toggleLatencyWidget') {
      onToggleLatencyWidget()
    }

    if (result.action !== 'clearHistory') {
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
        <div className="p-2">EchoSH v1.0 - Click to start audio.</div>
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
