import { DataMuseWord } from "@/renderer/types/text.ts";
import wordsToColors from "@/renderer/assets/words.json";
import { ReactNode } from "react";

const EXCLUDED_WORDS: string[] = [
  "the",
  "and",
  "a",
  "an",
  "of",
  "in",
  "on",
  "at",
  "to",
  "for",
  "from",
  "by",
  "with",
  "about",
  "as",
  "is",
  "it",
  "this",
  "that",
  "these",
  "those",
  "be",
  "was",
  "were",
  "am",
  "are",
  "but",
  "or",
  "if",
  "than",
  "then",
  "so",
  "not",
  "no",
  "nor",
  "do",
  "does",
  "did",
  "has",
  "have",
  "had",
  "can",
  "could",
  "will",
  "would",
  "shall",
  "should",
  "may",
  "might",
  "must",
  "been",
  "he",
  "she",
  "him",
  "her",
  "his",
  "hers",
  "they",
  "them",
  "their",
  "theirs",
  "we",
  "us",
  "our",
  "ours",
  "you",
  "your",
  "yours",
  "i",
  "me",
  "my",
  "mine",
  "just",
  "who",
  "whom",
  "whose",
  "which",
  "what",
  "when",
  "where",
  "why",
  "how"
];

export class EffectController {
  // Add this if you want the array per-instance:
  private excludedWords: string[];
  private relatedWordsMemo: Record<string, string[]> = {};

  public maxCompareWords = 100;

  constructor() {
    this.excludedWords = EXCLUDED_WORDS.map((w) => w.toLowerCase());
  }

  tokenize(text: string): string[] {
    return text.match(/\w+|[^\w\s]+|\s+/g) ?? [];
  }

  async process(txt: string): Promise<ReactNode[]> {
    const tokens = this.tokenize(txt);

    let toCheck = tokens.filter(
      (t) => /^\w+$/.test(t) && !this.excludedWords.includes(t.toLowerCase())
    );

    const relatedWordsMap: Record<string, string[]> = {};
    await Promise.all(
      toCheck.map(async (word) => {
        relatedWordsMap[word] = await this.getRelatedWords(word);
      })
    );

    return tokens.map((token, i) => {
      if (!/^\w+$/.test(token)) return token; // Not a word

      // **NEW: Exclude stopwords**
      if (this.excludedWords.includes(token.toLowerCase())) return token;

      const relatedWords = relatedWordsMap[token] ?? [token];
      const color = this.getColorForWord(relatedWords);

      if (color) {
        return (
          <span key={i} style={{ color }}>
            {token}
          </span>
        );
      }
      return token;
    });
  }

  async getRelatedWords(word: string): Promise<string[]> {
    // Lowercase for consistency (since Datamuse is case-insensitive)
    const key = word.toLowerCase();
    // Check memoization first
    if (this.relatedWordsMemo[key]) return this.relatedWordsMemo[key];

    const resp = await fetch(
      `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=${this.maxCompareWords}`
    );
    const data = (await resp.json()) as DataMuseWord[];
    const result = [word].concat(data.map((d) => d.word));
    this.relatedWordsMemo[key] = result; // memoize for next time
    return result;
  }

  getColorForWord(words: string[]): string | undefined {
    for (const word of words) {
      // @ts-ignore
      if (wordsToColors[word.toLowerCase()]) {
        // @ts-ignore
        return wordsToColors[word.toLowerCase()];
      }
    }
    return undefined;
  }
}
