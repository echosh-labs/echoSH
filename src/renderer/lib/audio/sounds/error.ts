import { SoundBlueprint } from "@/renderer/lib/audio/audioBlueprints.ts";

export const errorSound: SoundBlueprint = {
  sources: [
    { type: "oscillator", oscillatorType: "square", frequency: 150 },
    {
      type: "oscillator",
      oscillatorType: "square",
      frequency: 150 * Math.pow(1.05946, 6), // Tritone
      detune: 10
    }
  ],
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 },
  duration: 0.5
}
