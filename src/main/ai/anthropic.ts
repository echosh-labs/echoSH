/**
 * @file src/main/ai/anthropic.ts
 * @description Claude adapter. Uses the official Anthropic SDK.
 */

import Anthropic from '@anthropic-ai/sdk'
import { ModelOption, Provider, Reply, RunOptions, ToolCall, ToolSpec, Turn } from './types'

/** Adaptive thinking with visible summaries; see the effort note in ../ai/index. */
const EFFORT = 'medium'

function toMessages(history: Turn[]): Anthropic.MessageParam[] {
  return history.map((turn): Anthropic.MessageParam => {
    if (turn.role === 'user') {
      return { role: 'user', content: turn.text }
    }

    if (turn.role === 'assistant') {
      const content: Anthropic.ContentBlockParam[] = []
      if (turn.text) content.push({ type: 'text', text: turn.text })
      for (const call of turn.toolCalls) {
        content.push({ type: 'tool_use', id: call.id, name: call.name, input: call.input })
      }
      // An assistant turn must never be empty.
      if (!content.length) content.push({ type: 'text', text: '(no output)' })
      return { role: 'assistant', content }
    }

    // Tool results ride on a user turn in the Anthropic format.
    return {
      role: 'user',
      content: turn.results.map((result) => ({
        type: 'tool_result' as const,
        tool_use_id: result.id,
        content: result.content,
        is_error: result.isError
      }))
    }
  })
}

function toTools(tools: ToolSpec[]): Anthropic.Tool[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters as Anthropic.Tool.InputSchema
  }))
}

export const anthropicProvider: Provider = {
  id: 'anthropic',
  label: 'Claude',
  keyHint: 'console.anthropic.com',

  async listModels(apiKey: string): Promise<ModelOption[]> {
    const client = new Anthropic({ apiKey })
    const models: ModelOption[] = []
    // The list result auto-paginates when iterated.
    for await (const model of client.models.list()) {
      models.push({ id: model.id, label: model.display_name || model.id })
    }
    return models
  },

  async run(options: RunOptions): Promise<Reply> {
    const client = new Anthropic({ apiKey: options.apiKey })

    const stream = client.messages.stream(
      {
        model: options.model,
        max_tokens: options.maxTokens,
        system: options.system,
        // `display` defaults to 'omitted' on current models, which streams
        // thinking blocks with empty text — the UI would sit on a spinner.
        thinking: { type: 'adaptive', display: 'summarized' },
        output_config: { effort: EFFORT },
        tools: toTools(options.tools),
        messages: toMessages(options.history)
      },
      { signal: options.signal }
    )

    stream.on('text', (delta) => options.onText(delta))
    stream.on('thinking', (_delta, snapshot) => options.onThinking(snapshot))

    const message = await stream.finalMessage()

    if (message.stop_reason === 'refusal') {
      throw new Error('Claude declined to answer that.')
    }

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    const toolCalls: ToolCall[] = message.content
      .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
      .map((block) => ({
        id: block.id,
        name: block.name,
        input: (block.input ?? {}) as Record<string, unknown>
      }))

    return { text, toolCalls, truncated: message.stop_reason === 'max_tokens' }
  }
}
