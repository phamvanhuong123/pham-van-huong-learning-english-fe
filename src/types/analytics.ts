// ─── Shared chart constants ────────────────────────────────────────────────────

export const PART_COLORS = {
  PART5: '#2563EB', // primary blue
  PART6: '#0D9488', // accent teal
  PART7: '#F59E0B', // warning amber
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export type EvaluationLevel = 'weak' | 'average' | 'good';

export function getEvaluationLevel(accuracy: number): EvaluationLevel {
  if (accuracy < 60) return 'weak';
  if (accuracy <= 80) return 'average';
  return 'good';
}

/** Bar fill color theo ngưỡng accuracy — recharts cần hex (không đọc CSS var) */
export function getBarColor(accuracy: number): string {
  if (accuracy < 60) return '#EF4444'; // destructive
  if (accuracy <= 80) return '#F59E0B'; // warning
  return '#22C55E'; // success
}

// ─── API Response types (mirrors backend) ─────────────────────────────────────

export interface AccuracyByPart {
  PART5: number | null;
  PART6: number | null;
  PART7: number | null;
}

export interface OverviewData {
  totalExams: number;
  totalQuestions: number;
  totalVocab: number;
  overallAccuracy: number | null; // null = chưa có bài nào
  accuracyByPart: AccuracyByPart;
}

export interface WeeklyProgress {
  weekStart: string;         // "YYYY-MM-DD" ISO Monday
  avgScore: number | null;   // null = tuần không có bài — KHÔNG phải 0
  examCount: number;
  accuracyByPart: AccuracyByPart;
}

export interface ProgressData {
  weekly: WeeklyProgress[];
}

export interface TopicStat {
  topic: string;
  totalQ: number;
  correctQ: number;
  accuracy: number; // 0–100
}

export interface TopicsData {
  topics: TopicStat[];
}

// ─── Chart data shapes ────────────────────────────────────────────────────────

/** Recharts LineChart data point — null cho tuần trống (connectNulls=false) */
export interface ChartDataPoint {
  weekStart: string;     // label hiển thị
  PART5: number | null;
  PART6: number | null;
  PART7: number | null;
}

/** Recharts BarChart data point */
export interface TopicBarData {
  topic: string;
  accuracy: number;
}

// ─── Mock data cho blur overlay Standard user ─────────────────────────────────

export const MOCK_TOPICS: TopicStat[] = [
  { topic: 'Verb Tense',   totalQ: 45, correctQ: 28, accuracy: 62 },
  { topic: 'Preposition',  totalQ: 38, correctQ: 20, accuracy: 53 },
  { topic: 'Connector',    totalQ: 30, correctQ: 18, accuracy: 60 },
  { topic: 'Vocabulary',   totalQ: 52, correctQ: 38, accuracy: 73 },
  { topic: 'Grammar',      totalQ: 41, correctQ: 35, accuracy: 85 },
];
