// ─── API Response Types ───────────────────────────────────────────────────────

export interface ExamListItem {
  id: string;
  title: string;
  part: 'PART5' | 'PART6' | 'PART7' | 'FULL';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: 'FREE' | 'VIP';
  totalQuestions: number;
  duration: number;
  userBestScore?: number;
  previewQuestions?: string[]; // 3 câu đầu (text only) cho VIP modal
}

export interface ExamListResponse {
  exams: ExamListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  part: 'PART5' | 'PART6' | 'PART7' | 'FULL';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  score: number;
  correctQ: number;
  totalQ: number;
  timeTaken: number;
  submittedAt: string;
  answers?: Record<string, string | null>; // questionId -> optionId (dùng cho Compare)
}

export interface ResultListResponse {
  results: ExamResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type FilterPart = 'ALL' | 'PART5' | 'PART6' | 'PART7' | 'FULL';
export type FilterDifficulty = 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';
export type FilterType = 'ALL' | 'FREE' | 'VIP';

// ─── ExamCard Component Types ──────────────────────────────────────────────────

export type ExamCardVariant = 'library' | 'history';

export interface ExamCardBaseProps {
  id: string;
  title: string;
  part: 'PART5' | 'PART6' | 'PART7' | 'FULL';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: 'FREE' | 'VIP';
  totalQuestions: number;
  duration: number; // phút
}

export interface ExamCardLibraryProps extends ExamCardBaseProps {
  variant: 'library';
  userBestScore?: number; // undefined nếu chưa làm
  userRole: 'STANDARD' | 'VIP' | 'ADMIN';
  onVIPLockClick: (examId: string) => void;
}

export interface ExamCardHistoryProps extends ExamCardBaseProps {
  variant: 'history';
  result: {
    id: string;
    score: number;
    correctQ: number;
    totalQ: number;
    timeTaken: number;
    submittedAt: string;
  };
  isSelected: boolean;
  userRole?: 'STANDARD' | 'VIP' | 'ADMIN';
  onSelect: (resultId: string) => void;
  onExportPDF?: (resultId: string) => void;
}

export type ExamCardProps = ExamCardLibraryProps | ExamCardHistoryProps;
