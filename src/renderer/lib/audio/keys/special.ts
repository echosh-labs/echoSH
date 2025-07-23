/**
 * @file src/renderer/lib/audio/keys/special.ts
 * @description A central registry for mapping specific key presses to their corresponding sound effects.
 * This allows for easy management and extension of unique key sounds.
 */

import { audioEngine } from "@/renderer/lib/audio/audioEngine.ts";
import { backspaceSwoosh } from "./backspace.ts";

// --- Instrument Registration ---
// Pre-compile and register frequently used sounds when this module is loaded.
audioEngine.registerInstrument('backspace', backspaceSwoosh);
// Register other common sounds like 'error', 'success' here.

/** An object that maps key names to functions that play their respective sounds. */
export const keySounds = {
  backspace: () => audioEngine.triggerInstrument('backspace')
}
