import { HistoryItem } from "./terminal";

export type AppInitData = {
  arch: string;
  version: string;
  history?: HistoryItem[];
  settings: Partial<AppSettings>;
}

export type AppSettings = {
  outputDevice: any
  /** Anthropic API key used by the `claude` command. Stays in the main process. */
  anthropicApiKey: string
  /** Appearance / liquid-glass styling. */
  accentColor: string   // hex, e.g. #58a6ff
  glassColor: string    // hex base tint, e.g. #181f2c
  glassOpacity: number  // 0..1 tint strength
  cornerRadius: number  // px
  fontFamily: string    // CSS font-family stack
};
