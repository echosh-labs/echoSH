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
  ClaudeToolResult
} from '@/renderer/types/claude'

/** Opus 4.8 — the most capable Claude model. */
const MODEL = 'claude-opus-4-8'

/**
 * Terminal output wants short answers fast, so we run at low effort and cap the
 * reply. Raise `effort` to 'high' (and `max_tokens`) if you'd rather trade
 * latency for depth on harder questions.
 */
const EFFORT = 'low'
const MAX_TOKENS = 4096

/** Safety net on the tool loop so a misbehaving turn can't spin forever. */
const MAX_ITERATIONS = 6

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
  'run_command runs any echoSH command and returns its output — tempo, volume,',
  'theme, chord, scale, arp, beat, help, and the rest. Use it to change settings',
  'the user asks for, to inspect state before answering, and to check a',
  "command's own help output rather than guessing its arguments. The <session>",
  'block lists every command actually available; trust that list over memory,',
  'and run `help <name>` if you are unsure of a syntax. It cannot call `claude`.',
  '',
  'Chain them freely: setting the tempo and then playing at it is two calls.',
  '',
  'Each user turn begins with a <session> block describing the live terminal:',
  'the platform, the app version, the commands echoSH provides, the current',
  'tempo, and the most recent scrollback. Use it to answer questions about what',
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

  if (ctx.commands.length) {
    lines.push(`available commands: ${ctx.commands.join(', ')}`)
  }

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
  block: Anthropic.ToolUseBlock
): Promise<ClaudeToolResult> {
  return new Promise((resolve) => {
    if (sender.isDestroyed()) {
      resolve({ id, toolUseId: block.id, content: 'Terminal closed.', isError: true })
      return
    }

    pendingTools.set(block.id, resolve)
    sender.send('claude:tool', {
      id,
      toolUseId: block.id,
      name: block.name,
      input: block.input
    })
  })
}

ipcMain.on('claude:tool_result', (_event, result: ClaudeToolResult) => {
  const resolve = pendingTools.get(result.toolUseId)
  if (!resolve) return
  pendingTools.delete(result.toolUseId)
  resolve(result)
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
          system: SYSTEM_PROMPT,
          thinking: { type: 'adaptive' },
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
        toolUses.map((block) => runToolInRenderer(event.sender, id, block))
      )

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
