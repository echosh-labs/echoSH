/**
 * @file src/renderer/types/claude.ts
 * @description Shared shapes for the renderer <-> main Claude bridge.
 */

/** One command and its rendered output, as it appeared in the terminal. */
export interface ScrollbackEntry {
  command: string
  output: string
}

/**
 * A snapshot of the live terminal, assembled by the renderer and handed to
 * Claude so it can answer questions about what the user just did.
 */
export interface ClaudeSessionContext {
  platform: string
  version: string
  /** Names of the commands echoSH provides. */
  commands: string[]
  /** Recent scrollback, oldest first. */
  scrollback: ScrollbackEntry[]
}

export interface ClaudeAskRequest {
  /** Correlates the request with its chunk/done/error replies. */
  id: string
  prompt: string
  context: ClaudeSessionContext
}

/** Streamed reply: `text` is the full response so far, not just the delta. */
export interface ClaudeChunk {
  id: string
  text: string
}

export interface ClaudeError {
  id: string
  message: string
}
