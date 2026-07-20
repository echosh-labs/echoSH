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
/** One argument of a command, flattened for the model. */
export interface CommandArgReference {
  /** Literal, flag, or `<placeholder>` as the user would type it. */
  label: string
  description?: string
}

/**
 * A command's full signature. Sent so Claude knows the syntax up front instead
 * of burning a tool call on `help <name>` before it can do anything.
 */
export interface CommandReference {
  name: string
  description: string
  args: CommandArgReference[]
}

export interface ClaudeSessionContext {
  platform: string
  version: string
  /** Every command echoSH provides, with its arguments. */
  commands: CommandReference[]
  /** Current synth tempo, so Claude can pitch note lengths sensibly. */
  bpm: number
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

// --- Tools ---------------------------------------------------------------
//
// Claude's tools run in the renderer, because that's where the audio engine
// lives. Main drives the conversation and dispatches each tool call across the
// IPC boundary, then waits for the result before continuing the turn.

/** A single note in a melody: a scientific-pitch name and a length in beats. */
export interface MelodyNote {
  note: string
  beats: number
}

export interface PlayMelodyInput {
  notes: MelodyNote[]
  /** Overrides the session tempo for this melody only. */
  bpm?: number
  /** Short label shown in the terminal while it plays. */
  title?: string
}

export interface RunCommandInput {
  /** A full echoSH command line, e.g. "tempo 140" or "theme matrix". */
  command: string
}

/** Main -> renderer: run this tool call and report back. */
export interface ClaudeToolCall {
  id: string
  toolUseId: string
  name: string
  input: unknown
}

/** Renderer -> main: the outcome of a tool call. */
export interface ClaudeToolResult {
  id: string
  toolUseId: string
  /** What Claude sees as the tool_result. */
  content: string
  isError?: boolean
  /**
   * An optional line for the user to see in the terminal (e.g. "♫ Playing ...").
   * Main splices it into the streamed text so the displayed output has a single
   * source of truth — the renderer can't append locally without the next chunk
   * overwriting it.
   */
  transcript?: string
}
