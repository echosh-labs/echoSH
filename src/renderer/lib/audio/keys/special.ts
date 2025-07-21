import { audioEngine } from "@/renderer/lib/audio/audioEngine.ts";
import { backspaceSwoosh } from "@/renderer/lib/audio/keys/backspace.ts";

export const keySounds = {
  backspace: () => audioEngine.playSoundFromBlueprint(backspaceSwoosh)
}
