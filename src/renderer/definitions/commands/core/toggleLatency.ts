// file: src/renderer/src/definitions/commands/core/toggleLatency.ts
import { CommandDefinition } from '../types'

export const toggleLatencyCommand: CommandDefinition = {
  name: "toggle:latency",
  description: "Shows or hides the audio latency diagnostic widget.",
  staticActions: ["toggleLatencyWidget"],
  soundBlueprint: {
    sources: [{ type: "oscillator", oscillatorType: "triangle", frequency: 600 }],
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.1, release: 0.1 },
    duration: 0.3
  },
  execute: (_args, contexts) => {
    contexts.setLatency(!contexts.latency)
    return {
      output: "Toggling audio latency widget..."
    }
  },
  argSet: []
};
