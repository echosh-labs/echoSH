import { CommandDefinition } from "@/renderer/definitions/commands/types.ts";
import { audioEngine } from "@/renderer/lib/audio/audioEngine.ts";


export const stopCommand: CommandDefinition = {
  name: "stop",
  description: "Stop any currently playing audio",
  execute: (_args) => {
    audioEngine.reset();

    return {
      output: ""
    }
  },
  argSet: []
}
