import type { ReactNode } from "react";

export interface HistoryItem {
  id: number
  command: string;
  output: ReactNode;
  cleared?: boolean;
}
