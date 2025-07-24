import { HistoryItem } from "./terminal";

export type AppInitData = {
  arch: string;
  version: string;
  history?: HistoryItem[];
  settings: Partial<AppSettings>;
}

export type AppSettings = {
  outputDevice: any
};
