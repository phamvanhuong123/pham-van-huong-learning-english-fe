// ─── API Types (mirror backend DashboardResponse) ────────────────────────────
export interface AccuracyByPart {
  PART5: number | null;
  PART6: number | null;
  PART7: number | null;
}

export interface DashboardStats {
  totalExamsDone: number;
  averageScore: number;
  accuracyByPart: AccuracyByPart;
  vocabCount: number;
  vocabDueToday: number;
}

export interface RecentResult {
  id: string;
  score: number;
  totalQ: number;
  correctQ: number;
  submittedAt: string;
  exam: { id: string; title: string; part: string };
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentResults: RecentResult[];
}

// ─── Component Prop Types ─────────────────────────────────────────────────────
export interface StatsGridProps {
  stats: DashboardStats;
}

export interface VocabDueCardProps {
  vocabDueToday: number;
}

export interface AccuracyByPartProps {
  accuracyByPart: AccuracyByPart;
}

export interface RecentResultsProps {
  recentResults: RecentResult[];
}
