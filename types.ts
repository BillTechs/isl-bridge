
export interface SignStep {
  gloss: string;
  description: string;
  imageUrl?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  input: string;
  output: string;
  type: 'ISL_TO_TXT' | 'TXT_TO_ISL';
}

export interface SignOfTheDay {
  gloss: string;
  meaning: string;
}

export enum TranslationMode {
  ISL_TO_ENGLISH = 'ISL_TO_ENGLISH',
  ENGLISH_TO_ISL = 'ENGLISH_TO_ISL'
}
