import { CommandDefinition, CommandResult } from '../types'
import { SoundBlueprint } from '@/renderer/lib/audio/audioBlueprints.ts'
import { CommandContexts } from '@/renderer/lib/commands/processedCommandResult.ts'
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
    commands: contexts.commandNames ?? [],
    scrollback
  }
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

export const claudeCommand: CommandDefinition = {
  name: 'claude',
  description: 'Ask Claude about your session — it can see your recent commands.',
  soundBlueprint: jingle,
  execute: (args = [], contexts): CommandResult => {
    const prompt = args.join(' ').trim()

    if (!prompt) {
      return { output: `${BURST}\n\n${pick(GREETINGS)}` }
    }

    // `claude reset` starts a fresh conversation without restarting the app.
    if (prompt === 'reset' || prompt === '--reset') {
      window.BRIDGE.resetClaude()
      return { output: 'Conversation cleared.' }
    }

    const id = crypto.randomUUID()
    const context = collectContext(contexts)

    return {
      output: '...',
      stream: (emit) => {
        const settle = (): void => {
          if (activeRequestId === id) activeRequestId = null
        }

        window.BRIDGE.onClaudeStream(id, {
          // Chunks carry the full response so far, so this is a plain replace.
          onChunk: (text) => emit(text),
          onDone: (text) => {
            settle()
            emit(text || '(no response)')
          },
          onError: (message) => {
            settle()
            emit(`claude: ${message}`)
          }
        })

        activeRequestId = id
        window.BRIDGE.askClaude({ id, prompt, context })
      }
    }
  },
  argSet: [
    { literal: 'reset', description: 'Forget the conversation so far.' },
    { placeholder: 'prompt...', description: 'Ask Claude something.' }
  ]
}
