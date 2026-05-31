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

  // Keep the command input focused whenever the window itself is focused, so
  // every keypress — characters, arrows, Tab, etc. — is handled by the
  // terminal without the user having to click the input first.
  useEffect(() => {
    const focusInput = () => inputRef.current?.focus()

    // Focus on mount and whenever the window regains focus.
    focusInput()
    window.addEventListener('focus', focusInput)

    // Safety net: if focus ever lands elsewhere while the window is focused,
    // route the next keypress back to the input (any key, not just printable).
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent): void => {
      const input = inputRef.current
      if (!input || document.activeElement === input) return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      // Don't steal focus from other editable fields (e.g. settings inputs).
      const active = document.activeElement as HTMLElement | null
      if (active && (active.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName))) {
        return
      }

      input.focus()
    }
    window.addEventListener('keydown', handleGlobalKeyDown)

    // When a click finishes, return focus to the input so typing just works —
    // BUT only if the user didn't select any text. This lets people drag-select
    // and copy output without the input immediately stealing focus and
    // collapsing the selection. Clicks that land on real controls are left be.
    const handleMouseUp = (): void => {
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) return

      const active = document.activeElement as HTMLElement | null
      if (active && (active.isContentEditable ||
        ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName))) {
        return
      }

      inputRef.current?.focus()
    }
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('focus', focusInput)
      window.removeEventListener('keydown', handleGlobalKeyDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

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
      className={`flex flex-col text-sm terminal-surface`}>
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
      <div className="glass-input-bar border-t border-border p-4">
        <form onSubmit={handleCommandSubmit}>
          <div className="flex items-center">
            <span className="mr-2 select-none">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              autoFocus
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
