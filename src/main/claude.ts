/**
 * @file src/main/claude.ts
 * @description Main-process bridge to the Anthropic API.
 *
 * The API key never reaches the renderer: it lives in electron-settings and is
 * read here, per request, so a freshly-saved key takes effect without an app
 * restart. The renderer sends a prompt plus a snapshot of the terminal session,
 * and receives text deltas back.
 */

import { ipcMain } from 'electron'
import Anthropic from '@anthropic-ai/sdk'
import settings from 'electron-settings'
import { AppSettings } from '@/renderer/types/app'
import { ClaudeAskRequest, ClaudeSessionContext } from '@/renderer/types/claude'

/** Opus 4.8 — the most capable Claude model. */
const MODEL = 'claude-opus-4-8'

/**
 * Terminal output wants short answers fast, so we run at low effort and cap the
 * reply. Raise `effort` to 'high' (and `max_tokens`) if you'd rather trade
 * latency for depth on harder questions.
 */
const EFFORT = 'low'
const MAX_TOKENS = 4096

const SYSTEM_PROMPT = [
  'You are Claude, answering inside echoSH — a musical terminal emulator where',
  'every keystroke and command is synthesised into sound. Users invoke you with',
  'the `claude` command.',
  '',
  'Each user turn begins with a <session> block describing the live terminal:',
  'the platform, the app version, the commands echoSH provides, and the most',
  'recent scrollback. Use it to answer questions about what just happened —',
  '"why did that fail", "what did I just run", "explain that output". The block',
  'is context the app assembled for you, not something the user typed; never',
  'quote it back verbatim or mention that you received it.',
  '',
  'Write for a terminal: plain text only, no markdown syntax, no tables, and no',
  'emoji. Keep answers to a few lines unless asked for more. Wrap nothing — the',
  'terminal wraps for you. Code goes on its own lines, indented two spaces.'
].join('\n')

/** Rolling conversation so follow-up questions have context. */
let conversation: Anthropic.MessageParam[] = []

/** Keep the history bounded — 20 messages is ~10 exchanges. */
const MAX_TURNS = 20

/** Longest single scrollback output we'll forward, in characters. */
const MAX_OUTPUT_CHARS = 800

/** In-flight requests, so a prompt can be cancelled. */
const inFlight = new Map<string, AbortController>()

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
    `echoSH version: ${ctx.version}`
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

  // Append the user turn up front so the request carries it; we trim it back if
  // the call fails, so the next prompt isn't sent with a dangling message.
  conversation.push({
    role: 'user',
    content: `${renderSessionContext(context)}\n\n${prompt}`
  })

  let text = ''
  try {
    const client = new Anthropic({ apiKey })

    const stream = client.messages.stream(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        thinking: { type: 'adaptive' },
        output_config: { effort: EFFORT },
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
    if (conversation.length > MAX_TURNS) conversation = conversation.slice(-MAX_TURNS)

    send('claude:done', { id, text })
  } catch (err) {
    conversation.pop()

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
