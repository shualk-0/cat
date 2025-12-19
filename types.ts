
export interface WordMeaning {
  pos: string; // Part of speech (e.g., n., v., adj.)
  definition: string; // Chinese meaning
}

export interface Word {
  id: string;
  english: string;
  meanings: WordMeaning[];
  phonetic: string;
  example: string;
  exampleZh?: string;
  englishDefinition?: string;
  imageUrl?: string; // New field for AI generated images
  level: number; // Ebbinghaus level (0-7)
  lastReview: number;
  nextReview: number;
  synonyms?: string[];
  roots?: string;
  isLearned: boolean;
}

export interface StorySentence {
  en: string;
  zh: string;
}

export interface StoryContent {
  sentences: StorySentence[];
  fullZh: string;
}

export type ViewState = 'HOME' | 'LEARNING' | 'REVIEWING' | 'SPELLING' | 'ARTICLE' | 'COMPLETED' | 'WORDBOOK';

export interface UserStats {
  biscuits: number;
  streak: number;
  totalWords: number;
  lastCheckIn: string;
}
