/**
 * @file src/main/ai/openai.ts
 * @description OpenAI adapter, over the Chat Completions API.
 */

import OpenAI from 'openai'
import { ModelOption, Provider, Reply, RunOptions, ToolCall, ToolSpec, Turn } from './types'

/**
 * The models endpoint returns every model on the account — embeddings, audio,
 * image, moderation — which makes for a noisy dropdown. These substrings drop
 * the families that can't serve a chat completion. It's a heuristic, so
 * `listModels` falls back to the unfiltered list if it matches everything;
 * a naming scheme we don't recognise yields a cluttered dropdown, never an
 * empty one.
 */
const NON_CHAT_MARKERS = [
  'embedding',
  'whisper',
  'tts',
  'dall-e',
  'moderation',
  'audio',
  'image',
  'realtime',
  'transcribe',
  'sora',
  'davinci',
  'babbage'
]

function toMessages(system: string, history: Turn[]): OpenAI.Chat.ChatCompletionMessageParam[] {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: system }
  ]

  for (const turn of history) {
    if (turn.role === 'user') {
      messages.push({ role: 'user', content: turn.text })
    } else if (turn.role === 'assistant') {
      messages.push({
        role: 'assistant',
        content: turn.text || null,
        ...(turn.toolCalls.length
          ? {
              tool_calls: turn.toolCalls.map((call) => ({
                id: call.id,
                type: 'function' as const,
                function: { name: call.name, arguments: JSON.stringify(call.input) }
              }))
            }
          : {})
      })
    } else {
      // Unlike Anthropic, each result is its own message.
      for (const result of turn.results) {
        messages.push({ role: 'tool', tool_call_id: result.id, content: result.content })
      }
    }
  }

  return messages
}

function toTools(tools: ToolSpec[]): OpenAI.Chat.ChatCompletionTool[] {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }))
}

export const openaiProvider: Provider = {
  id: 'openai',
  label: 'OpenAI',
  keyHint: 'platform.openai.com',

  async listModels(apiKey: string): Promise<ModelOption[]> {
    const client = new OpenAI({ apiKey })
    const all: ModelOption[] = []
    for await (const model of client.models.list()) {
      all.push({ id: model.id, label: model.id })
    }

    const chat = all.filter(
      (model) => !NON_CHAT_MARKERS.some((marker) => model.id.toLowerCase().includes(marker))
    )
    return (chat.length ? chat : all).sort((a, b) => a.id.localeCompare(b.id))
  },

  async run(options: RunOptions): Promise<Reply> {
    const client = new OpenAI({ apiKey: options.apiKey })

    const stream = await client.chat.completions.create(
      {
        model: options.model,
        messages: toMessages(options.system, options.history),
        tools: toTools(options.tools),
        max_completion_tokens: options.maxTokens,
        stream: true
      },
      { signal: options.signal }
    )

    let text = ''
    let finishReason: string | null = null
    // Tool calls stream in fragments keyed by index; name and id arrive on the
    // first fragment and arguments accumulate across later ones.
    const partials = new Map<number, { id: string; name: string; args: string }>()

    for await (const chunk of stream) {
      const choice = chunk.choices[0]
      if (!choice) continue

      if (choice.delta?.content) {
        text += choice.delta.content
        options.onText(choice.delta.content)
      }

      for (const call of choice.delta?.tool_calls ?? []) {
        const existing = partials.get(call.index) ?? { id: '', name: '', args: '' }
        partials.set(call.index, {
          id: call.id ?? existing.id,
          name: call.function?.name ?? existing.name,
          args: existing.args + (call.function?.arguments ?? '')
        })
      }

      if (choice.finish_reason) finishReason = choice.finish_reason
    }

    const toolCalls: ToolCall[] = []
    for (const [index, partial] of partials) {
      if (!partial.name) continue
      toolCalls.push({
        // A missing id would break result matching, so synthesise a stable one.
        id: partial.id || `call_${index}`,
        name: partial.name,
        input: safeParseArgs(partial.args)
      })
    }

    return { text, toolCalls, truncated: finishReason === 'length' }
  }
}

/**
 * Streamed arguments are concatenated JSON fragments. A truncated response can
 * leave them unparseable — treat that as empty input rather than throwing, so
 * the tool reports a useful error and the model can retry.
 */
function safeParseArgs(args: string): Record<string, unknown> {
  if (!args.trim()) return {}
  try {
    const parsed: unknown = JSON.parse(args)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}
