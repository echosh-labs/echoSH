import type { ReactNode } from "react";

export interface HistoryItem {
  id: number
  command: string;
  output: ReactNode;
  cleared?: boolean;
  /** Prompt this line was entered at. Defaults to "$"; chat mode uses "claude>". */
  prompt?: string;
}
