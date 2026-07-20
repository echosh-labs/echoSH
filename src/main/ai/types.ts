/**
 * @file src/main/ai/types.ts
 * @description Provider-neutral types for the AI bridge.
 *
 * Everything here lives under src/main so it can be imported at runtime. The
 * `@/renderer/...` alias is a compile-time path mapping only — importing a
 * *value* across that boundary emits an unresolvable require and crashes the
 * main process on boot. Types may be imported from the renderer; values may not.
 */

export type ProviderId = 'anthropic' | 'openai' | 'gemini'

export const PROVIDER_IDS: ProviderId[] = ['anthropic', 'openai', 'gemini']

export function isProviderId(value: unknown): value is ProviderId {
  return typeof value === 'string' && (PROVIDER_IDS as string[]).includes(value)
}

/** A model the user can pick, as reported by the provider's own API. */
export interface ModelOption {
  id: string
  label: string
}

export interface ToolCall {
  /** Provider-assigned call id. Gemini has none, so we synthesise one. */
  id: string
  name: string
  input: Record<string, unknown>
}

export interface ToolResult {
  id: string
  /** Gemini matches results to calls by name rather than id, so carry both. */
  name: string
  content: string
  isError?: boolean
}

/**
 * One conversation turn, stored provider-neutrally. Each adapter converts this
 * into its own wire format, so history survives a provider switch structurally
 * even though we reset it by policy.
 */
export type Turn =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; toolCalls: ToolCall[] }
  | { role: 'tool'; results: ToolResult[] }

/** A tool in neutral JSON Schema form; adapters reshape it per provider. */
export interface ToolSpec {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface RunOptions {
  apiKey: string
  model: string
  system: string
  history: Turn[]
  tools: ToolSpec[]
  maxTokens: number
  signal: AbortSignal
  /** Incremental visible text. */
  onText: (delta: string) => void
  /** Full reasoning text so far, where the provider exposes it. */
  onThinking: (snapshot: string) => void
}

export interface Reply {
  text: string
  toolCalls: ToolCall[]
  /** Hit the output cap — the caller warns the user and stops the loop. */
  truncated: boolean
}

export interface Provider {
  id: ProviderId
  label: string
  /** Where to get a key, shown in Settings. */
  keyHint: string
  listModels(apiKey: string): Promise<ModelOption[]>
  run(options: RunOptions): Promise<Reply>
}

/** True for a real user prompt, as opposed to a turn carrying tool results. */
export function isUserPromptTurn(turn: Turn): boolean {
  return turn.role === 'user'
}

/**
 * Bounds history without splitting a tool exchange. Cutting between an
 * assistant turn that made tool calls and the turn carrying their results
 * leaves an orphaned result, which every provider rejects. So we slice, then
 * advance to the next real user prompt.
 */
export function trimHistory(turns: Turn[], maxTurns: number): Turn[] {
  if (turns.length <= maxTurns) return turns

  let start = turns.length - maxTurns
  while (start < turns.length && !isUserPromptTurn(turns[start])) start++

  // If no clean boundary exists in the window, keep more history rather than
  // send a prefix the provider will reject.
  return start < turns.length ? turns.slice(start) : turns
}
