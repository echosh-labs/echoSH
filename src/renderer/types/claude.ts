/**
 * @file src/renderer/types/claude.ts
 * @description Shared shapes for the renderer <-> main Claude bridge.
 */

/**
 * Selectable response-length caps, shared so the Settings dropdown and the main
 * process can't drift apart.
 *
 * This is `max_tokens`, which bounds thinking *and* visible reply together — so
 * the floor is deliberately well above zero. Anything much under 4k risks the
 * reasoning eating the whole budget and truncating before the answer starts.
 */
export const TOKEN_LIMIT_OPTIONS = [
  { value: 4096, label: 'Short — 4K (fastest)' },
  { value: 8192, label: 'Normal — 8K' },
  { value: 16000, label: 'Long — 16K' },
  { value: 32000, label: 'Very long — 32K' },
  { value: 64000, label: 'Maximum — 64K (slowest)' }
] as const

export const DEFAULT_TOKEN_LIMIT = 4096

/** Clamps a stored value to a known option, so a hand-edited config can't 400. */
export function resolveTokenLimit(value: unknown): number {
  return TOKEN_LIMIT_OPTIONS.some((option) => option.value === value)
    ? (value as number)
    : DEFAULT_TOKEN_LIMIT
}

/**
 * The selectable AI providers, and which settings fields each one uses. Keeping
 * the field names here lets the Settings form drive every provider off one set
 * of controls instead of triplicating them.
 */
export const PROVIDER_OPTIONS = [
  {
    id: 'anthropic',
    label: 'Claude',
    keyField: 'anthropicApiKey',
    modelField: 'anthropicModel',
    keyHint: 'console.anthropic.com'
  },
  {
    id: 'openai',
    label: 'OpenAI',
    keyField: 'openaiApiKey',
    modelField: 'openaiModel',
    keyHint: 'platform.openai.com'
  },
  {
    id: 'gemini',
    label: 'Gemini',
    keyField: 'geminiApiKey',
    modelField: 'geminiModel',
    keyHint: 'aistudio.google.com'
  }
] as const

export type ProviderOption = (typeof PROVIDER_OPTIONS)[number]

export const DEFAULT_PROVIDER = 'anthropic'

export function providerOption(id: unknown): ProviderOption {
  return PROVIDER_OPTIONS.find((option) => option.id === id) ?? PROVIDER_OPTIONS[0]
}

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
