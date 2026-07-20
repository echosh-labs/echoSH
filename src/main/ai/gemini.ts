/**
 * @file src/main/ai/gemini.ts
 * @description Google Gemini adapter, over @google/genai.
 */

import { GoogleGenAI } from '@google/genai'
import { ModelOption, Provider, Reply, RunOptions, ToolCall, ToolSpec, Turn } from './types'

/**
 * Gemini's model ids come back namespaced ("models/gemini-x"). The generate
 * calls accept the bare name, so strip the prefix for both display and use.
 */
function bareModelId(name: string): string {
  return name.replace(/^models\//, '')
}

function toContents(history: Turn[]): { role: string; parts: Record<string, unknown>[] }[] {
  return history.map((turn) => {
    if (turn.role === 'user') {
      return { role: 'user', parts: [{ text: turn.text }] }
    }

    if (turn.role === 'assistant') {
      const parts: Record<string, unknown>[] = []
      if (turn.text) parts.push({ text: turn.text })
      for (const call of turn.toolCalls) {
        parts.push({ functionCall: { name: call.name, args: call.input } })
      }
      if (!parts.length) parts.push({ text: '(no output)' })
      return { role: 'model', parts }
    }

    // Gemini matches a response to its call by function *name*, not by id —
    // which is why ToolResult carries the name alongside the id.
    return {
      role: 'user',
      parts: turn.results.map((result) => ({
        functionResponse: {
          name: result.name,
          response: { output: result.content, ...(result.isError ? { error: true } : {}) }
        }
      }))
    }
  })
}

function toFunctionDeclarations(tools: ToolSpec[]): Record<string, unknown>[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }))
}

export const geminiProvider: Provider = {
  id: 'gemini',
  label: 'Gemini',
  keyHint: 'aistudio.google.com',

  async listModels(apiKey: string): Promise<ModelOption[]> {
    const ai = new GoogleGenAI({ apiKey })
    const models: ModelOption[] = []

    const pager = await ai.models.list()
    for await (const model of pager) {
      // Only models that can serve generateContent are usable here; the list
      // also includes embedding and legacy models.
      const actions: string[] = (model.supportedActions as string[] | undefined) ?? []
      if (actions.length && !actions.includes('generateContent')) continue

      const id = bareModelId(model.name ?? '')
      if (!id) continue
      models.push({ id, label: model.displayName || id })
    }

    return models.sort((a, b) => a.id.localeCompare(b.id))
  },

  async run(options: RunOptions): Promise<Reply> {
    const ai = new GoogleGenAI({ apiKey: options.apiKey })

    const stream = await ai.models.generateContentStream({
      model: options.model,
      contents: toContents(options.history) as never,
      config: {
        systemInstruction: options.system,
        maxOutputTokens: options.maxTokens,
        abortSignal: options.signal,
        tools: [{ functionDeclarations: toFunctionDeclarations(options.tools) as never }]
      }
    })

    let text = ''
    const toolCalls: ToolCall[] = []
    let finishReason: string | undefined

    for await (const chunk of stream) {
      const delta = chunk.text
      if (delta) {
        text += delta
        options.onText(delta)
      }

      for (const call of chunk.functionCalls ?? []) {
        if (!call.name) continue
        toolCalls.push({
          // Gemini doesn't assign call ids; synthesise one so the neutral
          // result-matching path works the same as the other providers.
          id: call.id || `${call.name}_${toolCalls.length}`,
          name: call.name,
          input: (call.args ?? {}) as Record<string, unknown>
        })
      }

      const reason = chunk.candidates?.[0]?.finishReason
      if (reason) finishReason = String(reason)
    }

    return { text, toolCalls, truncated: finishReason === 'MAX_TOKENS' }
  }
}
