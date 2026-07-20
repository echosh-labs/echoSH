/**
 * @file src/main/ai/index.ts
 * @description Provider-neutral AI bridge: settings, the agentic loop, and IPC.
 *
 * API keys never reach the renderer — they live in electron-settings and are
 * read here per request, so a freshly saved key takes effect without a restart.
 * The renderer sends a prompt plus a snapshot of the terminal session, and
 * receives text/reasoning deltas back.
 *
 * Tools execute in the *renderer* (that's where the audio engine and command
 * processor live), so a tool call is dispatched over IPC and awaited before the
 * turn continues.
 */

import { ipcMain, WebContents } from 'electron'
import settings from 'electron-settings'
import { anthropicProvider } from './anthropic'
import { geminiProvider } from './gemini'
import { openaiProvider } from './openai'
import {
  ModelOption,
  Provider,
  ProviderId,
  ToolResult,
  ToolSpec,
  Turn,
  isProviderId,
  trimHistory
} from './types'

// See ./types for why these are `import type` only.
import type { AppSettings } from '@/renderer/types/app'
import type {
  ClaudeAskRequest,
  ClaudeSessionContext,
  ClaudeToolResult,
  CommandReference
} from '@/renderer/types/claude'

const PROVIDERS: Record<ProviderId, Provider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  gemini: geminiProvider
}

const DEFAULT_PROVIDER: ProviderId = 'anthropic'

/** Safety net on the tool loop so a misbehaving turn can't spin forever. */
const MAX_ITERATIONS = 6

/** How long to wait for the renderer to answer a tool call before giving up. */
const TOOL_TIMEOUT_MS = 15_000

/** Keep the history bounded — 20 turns is ~10 exchanges. */
const MAX_TURNS = 20

/** Longest single scrollback output we'll forward, in characters. */
const MAX_OUTPUT_CHARS = 800

const DEFAULT_MAX_TOKENS = 4096
const MIN_MAX_TOKENS = 1024
const MAX_MAX_TOKENS = 64000

const SYSTEM_PROMPT = [
  'You are an AI assistant embedded in echoSH — a musical terminal emulator',
  'where every keystroke and command is synthesised into sound. You are talking',
  'to the user inside their terminal.',
  '',
  'You can drive the app directly — you have real hands here, so use them.',
  '',
  'play_melody drives the synthesiser note by note, with rhythm. When the user',
  'asks you to play, compose, perform, or demo anything musical, CALL it — do',
  'not print note names and stop, and do not tell the user to run a command',
  'themselves. Playing it is the whole point. Compose something real: give it',
  'shape and phrasing rather than walking a scale, and vary note lengths.',
  '',
  'run_command runs any echoSH command and returns its output. Every command and',
  'its arguments are listed at the end of this prompt — that reference is',
  'generated from the running app, so trust it over memory and do not waste a',
  'turn running `help` to discover syntax you have already been given. Use',
  'run_command to change settings the user asks for and to inspect state before',
  'answering. It cannot call `claude`.',
  '',
  'Chain them freely: setting the tempo and then playing at it is two calls.',
  '',
  'For anything that should keep going — "drop a beat", "play something while I',
  'work", a groove, a jam — use the `loop` command, not play_melody. play_melody',
  'is a one-shot phrase that ends after a few seconds; loops run until stopped.',
  'Build a groove in layers, one run_command per track: drums first, then bass,',
  'then whatever carries the tune. Every track shares one grid, so a layer added',
  'ten seconds later still lands on the beat.',
  '',
  'Then keep mixing. The music is still playing between your tool calls, so you',
  'can bring a part in, drop it out, change a pattern, or ride the levels as you',
  'go, and the user hears each move land. Vary it rather than building a wall of',
  'sound and stopping: `loop vol`, `loop mute`, `loop drop`, and replacing a',
  'track pattern mid-groove are how a mix breathes. Prefer a few interesting',
  'layers over many dense ones, and leave space in the patterns.',
  '',
  'Act in the same turn you describe the action. If you find yourself writing',
  '"let me look that up", "I\'ll try it and see", or "let me test that", make the',
  'tool call instead — a turn that ends on a stated intention leaves the user',
  'staring at a prompt waiting for something that never happens. Never end your',
  'turn on a promise; end it on a result, or on a question only the user can',
  'answer.',
  '',
  'Each user turn begins with a <session> block describing the live terminal:',
  'the platform, the app version, the current tempo, and the most recent',
  'scrollback. Use it to answer questions about what just happened — "why did',
  'that fail", "what did I just run", "explain that output". The block is',
  'context the app assembled for you, not something the user typed; never quote',
  'it back verbatim or mention that you received it.',
  '',
  'Write for a terminal: plain text only, no markdown syntax, no tables, and no',
  'emoji. Keep answers to a few lines unless asked for more. Wrap nothing — the',
  'terminal wraps for you. Code goes on its own lines, indented two spaces.'
].join('\n')

const TOOLS: ToolSpec[] = [
  {
    name: 'play_melody',
    description:
      "Play a melody through the terminal's synthesiser. Call this whenever the user asks to hear " +
      'something — "play a melody", "compose a tune", "what does X sound like", "play something sad". ' +
      "The notes play immediately on the user's speakers. Prefer this over describing music in text.",
    parameters: {
      type: 'object',
      properties: {
        notes: {
          type: 'array',
          description: 'The notes in order. Roughly 8-32 notes makes a good phrase.',
          items: {
            type: 'object',
            properties: {
              note: {
                type: 'string',
                description:
                  'Scientific pitch notation, e.g. "C4", "F#5", "Bb3". Octave defaults to 4 if omitted.'
              },
              beats: {
                type: 'number',
                description: 'Length in beats. 1 is a quarter note, 0.5 an eighth, 2 a half.'
              }
            },
            required: ['note', 'beats']
          }
        },
        bpm: {
          type: 'number',
          description: 'Tempo override for this melody. Omit to use the session tempo.'
        },
        title: { type: 'string', description: 'A short label shown while it plays.' }
      },
      required: ['notes']
    }
  },
  {
    name: 'run_command',
    description:
      'Run an echoSH command and get its output back, exactly as if the user had typed it. Use this ' +
      'to change settings the user asks for (tempo, volume, theme, colour), to play the built-in ' +
      'musical commands (chord, scale, arp, beat, note), and to inspect state before answering. The ' +
      'available commands are listed at the end of the system prompt. Cannot invoke `claude`. This ' +
      'is also how you run `loop` — the continuous, layered playback you should reach for whenever ' +
      'music needs to keep going rather than stop after a few seconds.',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The full command line, e.g. "tempo 140", "chord Am", "beat rock".'
        }
      },
      required: ['command']
    }
  }
]

// --- Settings ------------------------------------------------------------

async function readSettings(): Promise<Partial<AppSettings>> {
  return ((await settings.get('settings')) ?? {}) as Partial<AppSettings>
}

function resolveProvider(value: unknown): Provider {
  return PROVIDERS[isProviderId(value) ? value : DEFAULT_PROVIDER]
}

/**
 * The renderer owns the labelled option list for its dropdown; main only needs
 * to know a stored value is sane, so it range-checks rather than importing that
 * list across the type-only boundary.
 */
function resolveTokenLimit(value: unknown): number {
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= MIN_MAX_TOKENS &&
    value <= MAX_MAX_TOKENS
    ? Math.floor(value)
    : DEFAULT_MAX_TOKENS
}

function apiKeyFor(provider: ProviderId, stored: Partial<AppSettings>): string | undefined {
  const key =
    provider === 'anthropic'
      ? stored.anthropicApiKey
      : provider === 'openai'
        ? stored.openaiApiKey
        : stored.geminiApiKey
  return key?.trim() || undefined
}

function modelFor(provider: ProviderId, stored: Partial<AppSettings>): string | undefined {
  const model =
    provider === 'anthropic'
      ? stored.anthropicModel
      : provider === 'openai'
        ? stored.openaiModel
        : stored.geminiModel
  return model?.trim() || undefined
}

// --- Conversation --------------------------------------------------------

let conversation: Turn[] = []
/** Which provider the stored history belongs to; switching resets it. */
let conversationProvider: ProviderId | null = null

let systemPromptCache: { key: string; prompt: string } | null = null

/**
 * The system prompt with the command reference appended. Cached because prompt
 * caching is a prefix match — the command set doesn't change while the app
 * runs, so the value must stay byte-identical or every cached turn is
 * reprocessed at full price.
 */
function buildSystemPrompt(commands: CommandReference[]): string {
  const key = commands.map((command) => command.name).join(',')
  if (systemPromptCache?.key === key) return systemPromptCache.prompt

  const lines: string[] = [SYSTEM_PROMPT, '', 'echoSH command reference:']
  for (const command of commands) {
    lines.push(`  ${command.name} — ${command.description}`)
    for (const arg of command.args) {
      lines.push(`      ${arg.label}${arg.description ? ` — ${arg.description}` : ''}`)
    }
  }

  const prompt = lines.join('\n')
  systemPromptCache = { key, prompt }
  return prompt
}

/**
 * Renders the terminal snapshot into the `<session>` block the system prompt
 * describes. Long outputs are clipped from the middle so both the start and the
 * (usually more telling) tail survive.
 */
function renderSessionContext(ctx: ClaudeSessionContext): string {
  const lines: string[] = [
    '<session>',
    `platform: ${ctx.platform}`,
    `echoSH version: ${ctx.version}`,
    `tempo: ${ctx.bpm} bpm`
  ]

  if (ctx.scrollback.length) {
    lines.push('', 'recent scrollback (oldest first):')
    for (const entry of ctx.scrollback) {
      lines.push(`$ ${entry.command}`)
      const output = entry.output.trim()
      if (!output) continue
      lines.push(
        output.length > MAX_OUTPUT_CHARS
          ? `${output.slice(0, MAX_OUTPUT_CHARS / 2)}\n...[trimmed]...\n${output.slice(-MAX_OUTPUT_CHARS / 2)}`
          : output
      )
    }
  }

  lines.push('</session>')
  return lines.join('\n')
}

// --- Tool dispatch -------------------------------------------------------

/** In-flight requests, so a prompt can be cancelled. */
const inFlight = new Map<string, AbortController>()

/** Tool calls awaiting a renderer result, keyed by call id. */
const pendingTools = new Map<string, (result: ClaudeToolResult) => void>()

/**
 * Dispatches one tool call to the renderer and resolves with whatever it
 * reports. Rejecting isn't useful — a failed tool should reach the model as an
 * error result it can adapt to, not blow up the turn.
 */
function runToolInRenderer(
  sender: WebContents,
  id: string,
  call: { id: string; name: string; input: unknown },
  signal: AbortSignal
): Promise<ClaudeToolResult> {
  return new Promise((resolve) => {
    if (sender.isDestroyed()) {
      resolve({ id, toolUseId: call.id, content: 'Terminal closed.', isError: true })
      return
    }

    // Every exit path must settle the promise and drop the pending entry — the
    // turn is blocked on this, so a lost reply would hang it forever.
    const finish = (result: ClaudeToolResult): void => {
      if (!pendingTools.has(call.id)) return
      pendingTools.delete(call.id)
      clearTimeout(timer)
      signal.removeEventListener('abort', onAbort)
      resolve(result)
    }

    const onAbort = (): void =>
      finish({ id, toolUseId: call.id, content: 'Interrupted by the user.', isError: true })

    const timer = setTimeout(
      () => finish({ id, toolUseId: call.id, content: 'Tool timed out.', isError: true }),
      TOOL_TIMEOUT_MS
    )

    pendingTools.set(call.id, finish)
    signal.addEventListener('abort', onAbort, { once: true })

    sender.send('claude:tool', { id, toolUseId: call.id, name: call.name, input: call.input })
  })
}

ipcMain.on('claude:tool_result', (_event, result: ClaudeToolResult) => {
  // Hand off to `finish`, which owns the map entry, the timer, and the abort
  // listener. Deleting here first would make its own guard see a missing entry
  // and bail without ever resolving — deadlocking the turn.
  pendingTools.get(result.toolUseId)?.(result)
})

// --- Model listing -------------------------------------------------------

ipcMain.handle('ai:listModels', async (_event, providerId: unknown): Promise<ModelOption[]> => {
  const provider = resolveProvider(providerId)
  const stored = await readSettings()
  const apiKey = apiKeyFor(provider.id, stored)

  // Surfaced in the dropdown's placeholder, so keep it short and actionable.
  if (!apiKey) throw new Error(`Add a ${provider.label} API key first.`)

  return provider.listModels(apiKey)
})

// --- The turn ------------------------------------------------------------

ipcMain.on('claude:ask', async (event, { id, prompt, context }: ClaudeAskRequest) => {
  const send = (channel: string, payload: unknown): void => {
    if (!event.sender.isDestroyed()) event.sender.send(channel, payload)
  }

  const stored = await readSettings()
  const provider = resolveProvider(stored.aiProvider)
  const apiKey = apiKeyFor(provider.id, stored)
  const model = modelFor(provider.id, stored)
  const maxTokens = resolveTokenLimit(stored.claudeMaxTokens)

  if (!apiKey) {
    send('claude:error', {
      id,
      message: `No ${provider.label} API key set. Add one under Settings.`
    })
    return
  }
  if (!model) {
    send('claude:error', {
      id,
      message: `No ${provider.label} model selected. Pick one under Settings.`
    })
    return
  }

  // Histories aren't portable between providers' wire formats, so a switch
  // starts a fresh conversation rather than replaying a translated one.
  if (conversationProvider !== provider.id) {
    conversation = []
    conversationProvider = provider.id
  }

  const controller = new AbortController()
  inFlight.set(id, controller)

  // Snapshot so a failed turn rolls back wholesale — a half-finished tool
  // exchange left behind would make the next request invalid.
  const checkpoint = conversation.slice()
  conversation.push({
    role: 'user',
    text: `${renderSessionContext(context)}\n\n${prompt}`
  })

  let text = ''
  try {
    const system = buildSystemPrompt(context.commands)

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      const reply = await provider.run({
        apiKey,
        model,
        system,
        history: conversation,
        tools: TOOLS,
        maxTokens,
        signal: controller.signal,
        onText: (delta) => {
          text += delta
          send('claude:chunk', { id, text })
        },
        onThinking: (snapshot) => send('claude:thinking', { id, text: snapshot })
      })

      if (reply.truncated) {
        const hint = `[cut off at the ${Math.round(maxTokens / 1000)}K token limit — raise it in Settings]`
        text = text ? `${text.trimEnd()}\n\n${hint}` : hint
        // Roll back rather than record a truncated turn: it may end on a tool
        // call with no matching result, which would reject the next request.
        conversation = checkpoint
        break
      }

      conversation.push({ role: 'assistant', text: reply.text, toolCalls: reply.toolCalls })
      if (!reply.toolCalls.length) break

      // Calls in one message are independent — run them together, then return
      // every result in a single turn, as all three providers expect.
      const results = await Promise.all(
        reply.toolCalls.map((call) => runToolInRenderer(event.sender, id, call, controller.signal))
      )

      // An interrupt during tool execution doesn't reject anything we're
      // awaiting, so check for it explicitly before starting another turn.
      if (controller.signal.aborted) throw new Error('Interrupted')

      const toolResults: ToolResult[] = results.map((result, index) => ({
        id: result.toolUseId,
        name: reply.toolCalls[index].name,
        content: result.content,
        isError: result.isError
      }))
      conversation.push({ role: 'tool', results: toolResults })

      // Show the user what the tool did, between the pre-tool narration and
      // whatever the model says next.
      for (const result of results) {
        if (!result.transcript) continue
        if (text && !text.endsWith('\n')) text += '\n'
        text += `${result.transcript}\n`
      }
      if (text && !text.endsWith('\n')) text += '\n'
      send('claude:chunk', { id, text })
    }

    conversation = trimHistory(conversation, MAX_TURNS)
    send('claude:done', { id, text })
  } catch (err) {
    conversation = checkpoint

    if (controller.signal.aborted) {
      send('claude:done', { id, text: text ? `${text}\n^C` : '^C' })
    } else {
      send('claude:error', { id, message: describeError(err) })
    }
  } finally {
    inFlight.delete(id)
  }
})

ipcMain.on('claude:cancel', (_event, { id }: { id: string }) => {
  inFlight.get(id)?.abort()
})

ipcMain.on('claude:reset', () => {
  conversation = []
})

/**
 * Providers throw different error shapes, so this leans on whatever message
 * they carry and adds hints for the cases a terminal user can act on.
 */
function describeError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)

  if (/401|unauthorized|invalid[_ ]api[_ ]key|api key not valid/i.test(message)) {
    return 'Authentication failed - check your API key in Settings.'
  }
  if (/429|rate.?limit|quota/i.test(message)) {
    return 'Rate limited. Try again in a moment.'
  }
  if (/ENOTFOUND|ECONNREFUSED|fetch failed|network/i.test(message)) {
    return 'Could not reach the API - are you online?'
  }
  return message
}
