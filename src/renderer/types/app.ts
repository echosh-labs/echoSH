import { HistoryItem } from "./terminal";

export type AppInitData = {
  arch: string;
  version: string;
  history?: HistoryItem[];
  settings: Partial<AppSettings>;
}

export type AppSettings = {
  outputDevice: any
  /** Which AI backs the `claude` command: 'anthropic' | 'openai' | 'gemini'. */
  aiProvider: string
  /** API keys. Read only in the main process; never sent to the renderer. */
  anthropicApiKey: string
  openaiApiKey: string
  geminiApiKey: string
  /** Selected model per provider, so switching back keeps your choice. */
  anthropicModel: string
  openaiModel: string
  geminiModel: string
  /** Response length cap (`max_tokens`). See TOKEN_LIMIT_OPTIONS. */
  claudeMaxTokens: number
  /** Appearance / liquid-glass styling. */
  accentColor: string   // hex, e.g. #58a6ff
  glassColor: string    // hex base tint, e.g. #181f2c
  glassOpacity: number  // 0..1 tint strength
  cornerRadius: number  // px
  fontFamily: string    // CSS font-family stack
};
