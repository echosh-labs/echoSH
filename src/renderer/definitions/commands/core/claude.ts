import { CommandDefinition, CommandResult } from '../types'
import { SoundBlueprint } from '@/renderer/lib/audio/audioBlueprints.ts'
import { CommandContexts } from '@/renderer/lib/commands/processedCommandResult.ts'
import { audioEngine } from '@/renderer/lib/audio/audioEngine.ts'
import { createSidechain } from '@/renderer/lib/audio/sidechain.ts'
import { ClaudeSessionContext, ScrollbackEntry } from '@/renderer/types/claude.ts'

// A warm, ascending major-9th shimmer — Claude's little signature jingle.
const jingle: SoundBlueprint = {
  sources: [
    { type: 'oscillator', oscillatorType: 'sine', frequency: 523.25 }, // C5
    { type: 'oscillator', oscillatorType: 'sine', frequency: 659.25 }, // E5
    { type: 'oscillator', oscillatorType: 'triangle', frequency: 783.99 }, // G5
    { type: 'oscillator', oscillatorType: 'sine', frequency: 987.77 } // B5
  ],
  envelope: { attack: 0.02, decay: 0.4, sustain: 0.25, release: 1.2 },
  filter: { type: 'biquad', filterType: 'lowpass', frequency: 2600, Q: 0.7 },
  reverb: { decay: 2.4, mix: 0.35 },
  duration: 1.6
}

// The unmistakable Anthropic sunburst, rendered in glorious ASCII.
const BURST = `        \\  |  /
         \\ | /
      --   *   --
         / | \\
        /  |  \\`

const GREETINGS: string[] = [
  "Hi, I'm Claude. I turn coffee and context windows into code.",
  "Claude here. I read the whole file before editing it — promise.",
  "Claude reporting for duty. Let's make something that compiles.",
  "Hey! I'm Claude. I'll be your pair programmer this evening.",
  "Claude online. Tabs or spaces? ...I'll match your existing style."
]

const pick = (xs: string[]): string => xs[Math.floor(Math.random() * xs.length)]

/** How many past commands to show Claude. */
const SCROLLBACK_DEPTH = 12

/** Words that leave chat mode, matched case-insensitively. */
const EXIT_WORDS = new Set(['exit', 'quit', '/exit', '/quit', ':q'])

export function isChatExitCommand(input: string): boolean {
  return EXIT_WORDS.has(input.trim().toLowerCase())
}

/**
 * Snapshots the terminal so Claude can answer questions about what just
 * happened ("why did that fail?") rather than only the literal prompt.
 *
 * History outputs are typed as ReactNode because commands may render rich
 * output; in practice they're strings, and anything else is skipped rather than
 * stringified into `[object Object]`.
 */
function collectContext(contexts: CommandContexts): ClaudeSessionContext {
  const scrollback: ScrollbackEntry[] = contexts.history
    .filter((item) => !item.cleared)
    .slice(-SCROLLBACK_DEPTH)
    .map((item) => ({
      command: item.command,
      output: typeof item.output === 'string' ? item.output : ''
    }))

  return {
    platform: contexts.arch ?? 'unknown',
    version: contexts.version ?? 'unknown',
    commands: contexts.commandReference ?? [],
    bpm: audioEngine.getBpm(),
    scrollback
  }
}

/** Braille spinner — one cell wide, so the line doesn't jitter as it turns. */
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const SPINNER_INTERVAL_MS = 80

/** Longest slice of reasoning shown on the status line. */
const THINKING_PREVIEW_CHARS = 88

/**
 * Reduces the reasoning snapshot to a single trailing line. Thinking arrives as
 * paragraphs; showing all of it would shove the terminal around on every tick,
 * so we show the current thought and let it scroll through in place.
 */
function lastLine(thinking: string): string {
  const line = thinking.trimEnd().split('\n').filter(Boolean).pop()
  if (!line) return ''
  const trimmed = line.trim()
  return trimmed.length > THINKING_PREVIEW_CHARS
    ? `…${trimmed.slice(-THINKING_PREVIEW_CHARS)}`
    : trimmed
}

/** The request currently streaming, if any, so Ctrl+C can abort it. */
let activeRequestId: string | null = null

/**
 * Aborts an in-flight `claude` reply. Returns whether there was one — the
 * caller (Ctrl+C handling) uses that to decide if it also clears the input.
 */
export function cancelActiveClaudeRequest(): boolean {
  if (!activeRequestId) return false
  window.BRIDGE.cancelClaude(activeRequestId)
  activeRequestId = null
  return true
}

/**
 * Builds the streaming result for one prompt. Shared by the `claude` command
 * and by chat mode, which routes bare input here instead of the command parser.
 */
export function askClaude(prompt: string, contexts: CommandContexts): CommandResult {
  const id = crypto.randomUUID()
  const context = collectContext(contexts)

  return {
    output: `${SPINNER[0]} thinking`,
    stream: (emit) => {
      // Two voices: the answer across the full range, reasoning low and slow.
      // Per-request, so overlapping replies can't share a scheduling cursor.
      const answerVoice = createSidechain('answer')
      const thinkingVoice = createSidechain('thinking')

      let answer = ''
      let thinking = ''
      let frame = 0
      let done = false

      /**
       * The answer is the durable output; reasoning is transient scaffolding
       * shown beneath it and dropped when the turn ends. That keeps what gets
       * persisted to history clean — just the answer.
       */
      const render = (): void => {
        if (done) {
          emit(answer || '(no response)')
          return
        }

        const spinner = SPINNER[frame % SPINNER.length]
        const preview = lastLine(thinking)
        const status = preview ? `${spinner} ${preview}` : `${spinner} thinking`
        emit(answer ? `${answer}\n${status}` : status)
      }

      // Animate independently of the network so the terminal stays alive during
      // the long quiet stretch before the first token.
      const ticker = setInterval(() => {
        frame++
        render()
      }, SPINNER_INTERVAL_MS)

      const settle = (): void => {
        done = true
        clearInterval(ticker)
        if (activeRequestId === id) activeRequestId = null
        answerVoice.stop()
        thinkingVoice.stop()
      }

      window.BRIDGE.onClaudeStream(id, {
        // Chunks carry the full response so far, so this is a plain replace.
        onChunk: (text) => {
          answer = text
          answerVoice.feed(text)
          render()
        },
        onThinking: (text) => {
          thinking = text
          thinkingVoice.feed(text)
          render()
        },
        onDone: (text) => {
          answer = text
          answerVoice.feed(text)
          settle()
          render()
        },
        onError: (message) => {
          answer = `claude: ${message}`
          settle()
          render()
        }
      })

      activeRequestId = id
      window.BRIDGE.askClaude({ id, prompt, context })
    }
  }
}

export const claudeCommand: CommandDefinition = {
  name: 'claude',
  description: 'Start a chat with Claude — it can see your session and play sound.',
  soundBlueprint: jingle,
  execute: (args = [], contexts): CommandResult => {
    const prompt = args.join(' ').trim()

    // `claude reset` starts a fresh conversation without restarting the app.
    if (prompt === 'reset' || prompt === '--reset') {
      window.BRIDGE.resetClaude()
      contexts.setChatMode?.(false)
      return { output: 'Conversation cleared.' }
    }

    // Every entry point drops the user into chat mode; from here on, plain
    // input goes to Claude until they type `exit`.
    contexts.setChatMode?.(true)

    if (!prompt) {
      return {
        output: `${BURST}\n\n${pick(GREETINGS)}\n\nChat mode on — just type. 'exit' to leave, Ctrl+C to interrupt.`
      }
    }

    return askClaude(prompt, contexts)
  },
  argSet: [
    { literal: 'reset', description: 'Forget the conversation so far.' },
    { placeholder: 'prompt...', description: 'Ask Claude something.' }
  ]
}
