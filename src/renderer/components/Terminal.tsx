/**
 * @file src/renderer/src/components/Terminal.tsx
 * @description The main user interface component. It orchestrates user input,
 * command processing, and audio feedback.
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useTerminalContext } from "@/renderer/lib/contexts/terminalContext.tsx";

export const Terminal = () => {

  const terminalContext = useTerminalContext();

  const [input, setInput] = useState<string>('')

  const outputContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to the bottom of the output area when history changes.
  useEffect(() => {
    if (outputContainerRef.current) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight
    }
  }, [terminalContext.history])

  // Handles keyboard input for keystroke sounds and command history navigation.
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    terminalContext.handleKey(e, setInput);
  }

    // Main handler for command submission.
  const handleCommandSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const command = input.trim()
    if (!command) return

    terminalContext.execute(command);

    setInput('')
  }

  return (
    <div
      style={{height: 'calc(100vh - 54px)'}}
      className={`flex flex-col bg-background text-sm`}>
      <div className="flex-grow overflow-y-auto p-4 output-area" ref={outputContainerRef}>
        {terminalContext.history.filter(h => !h.cleared).map((item) => (
          <div key={item.id} className="mb-2">
            <div className="flex">
              <span className="mr-2 select-none">$</span>
              <span className="flex-shrink-1">{item.command}</span>
            </div>
            <div className="whitespace-pre-wrap">{item.output}</div>
          </div>
        ))}
      </div>

        {terminalContext.predictions.length > 0 && (
          <div className="input-area p-2">
            <div className="cmd-predictions text-output">
              {terminalContext.predictions.join(', ')}
            </div>
          </div>
        )}
      <div className="border-t border-border p-4">
        <form onSubmit={handleCommandSubmit}>
          <div className="flex items-center">
            <span className="mr-2 select-none">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border-none bg-transparent p-0 caret-primary focus:outline-none focus:ring-0"
              autoComplete="off"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
