// ─── API Response Types ───────────────────────────────────────────────────────
export type ExamPart = 'PART1' | 'PART2' | 'PART3' | 'PART4' | 'PART5' | 'PART6' | 'PART7' | 'FULL';
export type MediaType = 'TEXT' | 'AUDIO' | 'IMAGE' | 'VIDEO';


export interface ExamListItem {
  id: string;
  title: string;
  part: ExamPart;
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
  part: ExamPart;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  score: number;
  correctQ: number;
  totalQ: number;
  timeTaken: number;
  submittedAt: string;
  answers?: Record<string, string | null>; // questionId -> optionId (dùng cho Compare)
}

export interface ExamResultOption {
  id: string;
  label: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuestionDetail {
  questionId: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string | null;
  grammarTopic: string | null;
  question: {
    passageGroupId?: string | null;
    passageGroup?: {
      id: string;
      passages: {
        id: string;
        content: string | null;
        order: number;
        mediaUrl?: string | null;
        mediaType?: 'TEXT' | 'AUDIO' | 'IMAGE' | 'VIDEO';
      }[];
    } | null;
    questionText: string;
    options: ExamResultOption[];
  };
}

export interface ExamResultDetail {
  resultId: string;
  score: number;
  correctQ: number;
  totalQ: number;
  timeTaken: number;
  submittedAt: string;
  exam: {
    id: string;
    title: string;
    part: string;
  };
  details: QuestionDetail[];
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

export type FilterPart = 'ALL' | ExamPart;
export type FilterDifficulty = 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';
export type FilterType = 'ALL' | 'FREE' | 'VIP';

// ─── ExamCard Component Types ──────────────────────────────────────────────────

export type ExamCardVariant = 'library' | 'history';

export interface ExamCardBaseProps {
  id: string;
  title: string;
  part: ExamPart;
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
  onStart?: (examId: string) => void;
  onRetry?: (examId: string) => void;
  onViewResult?: (examId: string) => void;
  hasSession?: boolean;
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
