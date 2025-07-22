import { Token, TextEffect } from "@/renderer/types/text.ts";

export class EffectController {
  private effects: TextEffect[] = [];

  registerEffect(effect: TextEffect) {
    this.effects.push(effect);
  }

  // Optionally support plugin "unregister"
  unregisterEffect(testFn: TextEffect["test"]) {
    this.effects = this.effects.filter((e) => e.test !== testFn);
  }

  getEffects() {
    return this.effects;
  }

  // Find the first effect matching the token
  getEffectForToken(token: Token, idx: number, tokens: Token[]) {
    return this.effects.find((effect) => effect.test(token, idx, tokens));
  }

  getConceptForWord(word: string, map: Record<string, string[]>): string | null {
    word = word.toLowerCase();
    for (const [concept, words] of Object.entries(map)) {
      if (words.includes(word)) return concept;
    }
    return null;
  }
}
