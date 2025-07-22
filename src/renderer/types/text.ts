// A token can be a word or punctuation
export type Token = {
  value: string;
  type: 'word' | 'punctuation' | 'whitespace';
};

// An effect applies a React style or element to a token
export interface TextEffect {
  test: (token: Token, index: number, tokens: Token[]) => boolean;
  render: (token: Token, index: number, tokens: Token[]) => React.ReactNode;
}
export type DataMuseWord = {
  word: string;
  score?: number;
  tags?: string[];
};
