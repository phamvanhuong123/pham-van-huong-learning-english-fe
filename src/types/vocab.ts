// ─── SM-2 Status ──────────────────────────────────────────────────────────────
export type SM2Status = 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';
export type SM2Rating = 0 | 1 | 2 | 3; // Again | Hard | Good | Easy

// ─── Domain Types ─────────────────────────────────────────────────────────────
export interface VocabSchedule {
  id: string;
  status: SM2Status;
  nextReviewAt: string; // ISO string from backend
  interval: number;
  repetitions?: number;
  ef?: number;
}

export interface Vocab {
  id: string;
  word: string;
  meaning: string;
  example?: string | null;
  topic?: string | null;
  createdAt: string; // ISO string
  schedule: VocabSchedule | null;
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface VocabLimitInfo {
  used: number;
  max: number | null;        // null = VIP (unlimited)
  warnThreshold: number | null;
}

export interface GetVocabsResponse {
  vocabs: Vocab[];
  total: number;
  limitInfo: VocabLimitInfo;
}

export interface BulkImportResult {
  imported: number;
  skipped: number;
  skippedWords: string[];
}

export interface ReviewResult {
  nextReviewAt: string;
  interval: number;
  status: SM2Status;
}

// ─── Filter / Query Types ─────────────────────────────────────────────────────
export interface VocabFilter {
  status?: SM2Status | '';
  topic?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── CSV Import types ─────────────────────────────────────────────────────────
export interface CSVVocabRow {
  word: string;
  meaning: string;
  example?: string;
  topic?: string;
}

// ─── Flashcard Session types ──────────────────────────────────────────────────
export interface SessionSummary {
  again: number;
  hard: number;
  good: number;
  easy: number;
  total: number;
}

export interface FlashcardSession {
  queue: Vocab[];
  currentIndex: number;
  summary: SessionSummary;
  isFinished: boolean;
}

