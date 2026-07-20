/**
 * @file src/main/claude.ts
 * @description Main-process bridge to the Anthropic API.
 *
 * The API key never reaches the renderer: it lives in electron-settings and is
 * read here, per request, so a freshly-saved key takes effect without an app
 * restart. The renderer sends a prompt plus a snapshot of the terminal session,
 * and receives text deltas back.
 *
 * Claude's tools (currently just the synthesiser) execute in the *renderer* —
 * that's where the audio engine lives — so a tool call is dispatched over IPC
 * and awaited before the turn continues.
 */

import { ipcMain, WebContents } from 'electron'
import Anthropic from '@anthropic-ai/sdk'
import settings from 'electron-settings'
import { AppSettings } from '@/renderer/types/app'
import {
  ClaudeAskRequest,
  ClaudeSessionContext,
  ClaudeToolResult,
  CommandReference
} from '@/renderer/types/claude'

/** Opus 4.8 — the most capable Claude model. */
const MODEL = 'claude-opus-4-8'

/**
 * Terminal output wants short answers, but 'low' left almost nothing to watch —
 * effort controls how much Claude thinks, and at 'low' it mostly doesn't.
 * 'medium' gives visible reasoning without a long wait. Raise to 'high'/'xhigh'
 * for harder questions at the cost of latency.
 */
const EFFORT = 'medium'
const MAX_TOKENS = 4096

/** Safety net on the tool loop so a misbehaving turn can't spin forever. */
const MAX_ITERATIONS = 6

/** How long to wait for the renderer to answer a tool call before giving up. */
const TOOL_TIMEOUT_MS = 15_000

const SYSTEM_PROMPT = [
  'You are Claude, embedded in echoSH — a musical terminal emulator where every',
  'keystroke and command is synthesised into sound. You are talking to the user',
  'inside their terminal.',
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
  'Act in the same turn you describe the action. If you find yourself writing',
  '"let me look that up", "I\'ll try it and see", or "let me test that", make the',
  'tool call instead — a turn that ends on a stated intention leaves the user',
  'staring at a prompt waiting for something that never happens. Never end your',
  'turn on a promise; end it on a result, or on a question only the user can',
  'answer.',
  '',
  'Each user turn begins with a <session> block describing the live terminal:',
  'the platform, the app version, the current tempo, and the most recent',
  'scrollback. Use it to answer questions about what',
  'just happened — "why did that fail", "what did I just run", "explain that',
  'output". The block is context the app assembled for you, not something the',
  'user typed; never quote it back verbatim or mention that you received it.',
  '',
  'Write for a terminal: plain text only, no markdown syntax, no tables, and no',
  'emoji. Keep answers to a few lines unless asked for more. Wrap nothing — the',
  'terminal wraps for you. Code goes on its own lines, indented two spaces.'
].join('\n')

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'play_melody',
    description: [
      "Play a melody through the terminal's synthesiser. Call this whenever the",
      'user asks to hear something — "play a melody", "compose a tune", "what does',
      'X sound like", "play something sad". The notes are played immediately on',
      "the user's speakers. Prefer this over describing music in text."
    ].join(' '),
    input_schema: {
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
        title: {
          type: 'string',
          description: 'A short label for the melody, shown while it plays.'
        }
      },
      required: ['notes']
    }
  },
  {
    name: 'run_command',
    description: [
      'Run an echoSH command and get its output back, exactly as if the user had',
      'typed it. Use this to change settings the user asks for (tempo, volume,',
      'theme, colour), to play the built-in musical commands (chord, scale, arp,',
      'beat, note), and to inspect state before answering. Run `help <command>`',
      'when unsure of a syntax rather than guessing. The commands available in',
      'this session are listed in the <session> block. Cannot invoke `claude`.'
    ].join(' '),
    input_schema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The full command line, e.g. "tempo 140", "chord Am", "help arp".'
        }
      },
      required: ['command']
    }
  }
]

/**
 * The system prompt with the command reference appended. Cached because prompt
 * caching is a prefix match — the commands don't change while the app runs, so
 * rebuilding an identical string each turn is fine, but the *value* must stay
 * byte-identical or every cached turn is reprocessed at full price.
 */
let systemPromptCache: { key: string; prompt: string } | null = null

function buildSystemPrompt(commands: CommandReference[]): string {
  // The names alone identify the command set; descriptions and args are derived
  // from the same definitions, so they can't drift independently.
  const key = commands.map((c) => c.name).join(',')
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

/** Rolling conversation so follow-up questions have context. */
let conversation: Anthropic.MessageParam[] = []

/** Keep the history bounded — 20 messages is ~10 exchanges. */
const MAX_TURNS = 20

/** Longest single scrollback output we'll forward, in characters. */
const MAX_OUTPUT_CHARS = 800

/** In-flight requests, so a prompt can be cancelled. */
const inFlight = new Map<string, AbortController>()

/** Tool calls awaiting a result from the renderer, keyed by tool_use id. */
const pendingTools = new Map<string, (result: ClaudeToolResult) => void>()

async function readApiKey(): Promise<string | undefined> {
  const stored = ((await settings.get('settings')) ?? {}) as Partial<AppSettings>
  return stored.anthropicApiKey?.trim() || undefined
}

/**
 * Renders the terminal snapshot the renderer collected into the `<session>`
 * block the system prompt tells Claude to expect. Long command outputs are
 * clipped from the middle so both the start and the (usually more telling) tail
 * survive.
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

/**
 * Dispatches one tool call to the renderer and resolves with whatever it
 * reports back. Rejecting isn't useful here — a failed tool should be reported
 * to Claude as an error result so it can adapt, not blow up the turn.
 */
function runToolInRenderer(
  sender: WebContents,
  id: string,
  block: Anthropic.ToolUseBlock,
  signal: AbortSignal
): Promise<ClaudeToolResult> {
  return new Promise((resolve) => {
    if (sender.isDestroyed()) {
      resolve({ id, toolUseId: block.id, content: 'Terminal closed.', isError: true })
      return
    }

    // Every exit path has to settle the promise and drop the pending entry —
    // the turn is blocked on this, so a lost reply would hang it forever.
    const finish = (result: ClaudeToolResult): void => {
      if (!pendingTools.has(block.id)) return
      pendingTools.delete(block.id)
      clearTimeout(timer)
      signal.removeEventListener('abort', onAbort)
      resolve(result)
    }

    const onAbort = (): void =>
      finish({ id, toolUseId: block.id, content: 'Interrupted by the user.', isError: true })

    // Backstop for a renderer that never answers (crashed handler, closed
    // window mid-call). Tools here are near-instant, so this only ever fires on
    // something genuinely broken.
    const timer = setTimeout(
      () => finish({ id, toolUseId: block.id, content: 'Tool timed out.', isError: true }),
      TOOL_TIMEOUT_MS
    )

    pendingTools.set(block.id, finish)
    signal.addEventListener('abort', onAbort, { once: true })

    sender.send('claude:tool', {
      id,
      toolUseId: block.id,
      name: block.name,
      input: block.input
    })
  })
}

ipcMain.on('claude:tool_result', (_event, result: ClaudeToolResult) => {
  // Hand off to `finish`, which owns the map entry, the timer, and the abort
  // listener. Deleting here first would make its own guard see a missing entry
  // and bail without ever resolving — deadlocking the turn.
  pendingTools.get(result.toolUseId)?.(result)
})

ipcMain.on('claude:ask', async (event, { id, prompt, context }: ClaudeAskRequest) => {
  const send = (channel: string, payload: unknown): void => {
    // The window may have been closed mid-stream.
    if (!event.sender.isDestroyed()) event.sender.send(channel, payload)
  }

  const apiKey = await readApiKey()
  if (!apiKey) {
    send('claude:error', {
      id,
      message: 'No API key set. Add one under Settings -> Anthropic API Key.'
    })
    return
  }

  const controller = new AbortController()
  inFlight.set(id, controller)

  // Snapshot the conversation so a failed turn can be rolled back wholesale —
  // a partial tool exchange left behind would make the next request invalid.
  const checkpoint = conversation.slice()
  conversation.push({
    role: 'user',
    content: `${renderSessionContext(context)}\n\n${prompt}`
  })

  let text = ''
  try {
    const client = new Anthropic({ apiKey })

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      const stream = client.messages.stream(
        {
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: buildSystemPrompt(context.commands),
          // `display` defaults to 'omitted' on this model family, which streams
          // thinking blocks with empty text — the terminal would just sit on a
          // spinner. 'summarized' is what makes the reasoning watchable.
          thinking: { type: 'adaptive', display: 'summarized' },
          output_config: { effort: EFFORT },
          tools: TOOLS,
          messages: conversation
        },
        { signal: controller.signal }
      )

      stream.on('text', (delta) => {
        text += delta
        send('claude:chunk', { id, text })
      })

      // Reasoning goes on its own channel so the renderer can render and
      // sonify it differently, and discard it once the answer lands. The
      // snapshot restarts each iteration, which is what we want — thinking
      // after a tool call is a fresh thought, not a continuation.
      stream.on('thinking', (_delta, snapshot) => {
        send('claude:thinking', { id, text: snapshot })
      })

      const message = await stream.finalMessage()

      if (message.stop_reason === 'refusal') {
        throw new Error('Claude declined to answer that.')
      }

      conversation.push({ role: 'assistant', content: message.content })

      const toolUses = message.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      )
      if (!toolUses.length) break

      // Tool calls in one message are independent — run them together, then
      // return every result in a single user turn as the API requires.
      const results = await Promise.all(
        toolUses.map((block) => runToolInRenderer(event.sender, id, block, controller.signal))
      )

      // An interrupt during tool execution doesn't reject anything we're
      // awaiting, so check for it explicitly before starting another turn.
      if (controller.signal.aborted) throw new Error('Interrupted')

      conversation.push({
        role: 'user',
        content: results.map((result) => ({
          type: 'tool_result' as const,
          tool_use_id: result.toolUseId,
          content: result.content,
          is_error: result.isError
        }))
      })

      // Show the user what the tool actually did, between Claude's pre-tool
      // narration and whatever it says next.
      for (const result of results) {
        if (!result.transcript) continue
        if (text && !text.endsWith('\n')) text += '\n'
        text += `${result.transcript}\n`
      }
      if (text && !text.endsWith('\n')) text += '\n'
      send('claude:chunk', { id, text })
    }

    if (conversation.length > MAX_TURNS) conversation = conversation.slice(-MAX_TURNS)

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
 * Turns an SDK error into something worth printing in a terminal. The typed
 * error classes are checked most-specific first.
 */
function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return 'Authentication failed - check your API key in Settings.'
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return `This API key doesn't have access to ${MODEL}.`
  }
  if (err instanceof Anthropic.RateLimitError) {
    return 'Rate limited by the API. Try again in a moment.'
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return 'Could not reach the Anthropic API - are you online?'
  }
  if (err instanceof Anthropic.APIError) {
    return `API error ${err.status}: ${err.message}`
  }
  return err instanceof Error ? err.message : String(err)
}
