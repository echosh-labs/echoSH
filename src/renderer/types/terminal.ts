export interface HistoryItem {
  id: number;
  command: string;
  output: React.ReactNode;
  cleared?: boolean;
}
