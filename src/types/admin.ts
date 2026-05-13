/**
 * Admin Module — Type Definitions (Frontend)
 * Mirror của server/src/types/admin.ts
 */

// ─── Dashboard ──────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalUsers: number;
  vipUsers: number;
  examsToday: number;
  activeUsers7d: number;
}

export interface DailySignup {
  date: string; // 'YYYY-MM-DD'
  count: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  dailySignups: DailySignup[];
  pendingSubscriptions: number;
  openReports: number;
}

// ─── Users ──────────────────────────────────────────────────────────────────

export type UserRole = 'STANDARD' | 'VIP' | 'ADMIN';

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  isBanned: boolean;
  banReason: string | null;
  vipExpiresAt: string | null;
  createdAt: string;
  examCount: number;
}

export interface AdminUsersResponse {
  users: AdminUserItem[];
  pagination: PaginationMeta;
}

export interface UserUpdateBody {
  role?: UserRole;
  isBanned?: boolean;
  banReason?: string | null;
  vipExpiresAt?: string | null;
}

// ─── Subscriptions ──────────────────────────────────────────────────────────

export type SubscriptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type SubscriptionPlan = '1m' | '3m' | '12m';

export interface AdminSubscriptionItem {
  id: string;
  userId: string;
  user: { name: string; email: string; avatarUrl: string | null };
  status: SubscriptionStatus;
  plan: SubscriptionPlan | null;
  proofImageUrl: string | null;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubscriptionsResponse {
  subscriptions: AdminSubscriptionItem[];
  pagination: PaginationMeta;
}

export interface SubscriptionUpdateBody {
  status: 'APPROVED' | 'REJECTED';
  plan?: SubscriptionPlan;
  rejectReason?: string;
}

// ─── Questions ──────────────────────────────────────────────────────────────

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type OptionLabel = 'A' | 'B' | 'C' | 'D';
export type QuestionStatus = 'DRAFT' | 'PUBLISHED';

export interface QuestionOption {
  label: OptionLabel;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  examId: string;
  passageGroupId?: string | null;
  order: number;
  questionText: string;
  options: QuestionOption[];
  explanation: string;
  grammarTopic: string;
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  examTitle: string;
  passageGroup?: PassageGroup;
}

export interface QuestionCreateBody {
  examId: string;
  passageGroupId?: string;
  order: number;
  questionText: string;
  options: QuestionOption[];
  explanation: string;
  grammarTopic: string;
  difficulty: QuestionDifficulty;
  metadata?: any;
  status?: QuestionStatus;
}

export interface QuestionUpdateBody {
  passageGroupId?: string;
  order?: number;
  questionText?: string;
  options?: QuestionOption[];
  explanation?: string;
  grammarTopic?: string;
  difficulty?: QuestionDifficulty;
  metadata?: any;
  status?: QuestionStatus;
}

export type MediaType = 'TEXT' | 'AUDIO' | 'IMAGE' | 'VIDEO';

export interface Passage {
  id: string;
  passageGroupId: string;
  content: string | null;
  order: number;
  mediaUrl?: string | null;
  mediaType: MediaType;
}

export interface PassageGroup {
  id: string;
  examId: string;
  order: number;
  passages: Passage[];
}

export interface PassageCreateBody {
  content?: string;
  order: number;
  mediaUrl?: string;
  mediaType?: MediaType;
}

export interface PassageGroupCreateBody {
  examId: string;
  order: number;
  passages: PassageCreateBody[];
  questions?: QuestionCreateBody[];
}

// ─── Exams ──────────────────────────────────────────────────────────────────

export type ExamPart = 'PART1' | 'PART2' | 'PART3' | 'PART4' | 'PART5' | 'PART6' | 'PART7' | 'FULL';
export type ExamType = 'FREE' | 'VIP';

export interface ExamCreateBody {
  title: string;
  part: ExamPart;
  difficulty: QuestionDifficulty;
  type: ExamType;
  duration: number;
  /** Chỉ dùng khi part = 'FULL'. Danh sách ID các đề con */
  componentExamIds?: string[];
}

export interface AdminExamItem {
  id: string;
  title: string;
  part: ExamPart;
  difficulty: QuestionDifficulty;
  type: ExamType;
  duration: number;
  isPublished: boolean;
  questionCount: number;
  parentExamId: string | null;
  childExams?: { id: string; title: string; part: ExamPart }[];
  createdAt: string;
}

export interface AdminExamsResponse {
  exams: AdminExamItem[];
}

export interface ExamUpdateBody {
  title?: string;
  part?: ExamPart;
  difficulty?: QuestionDifficulty;
  type?: ExamType;
  duration?: number;
  isPublished?: boolean;
}

// ─── Notifications ──────────────────────────────────────────────────────────

export interface BroadcastBody {
  title: string;
  body: string;
  targetRole?: 'STANDARD' | 'VIP';
}

// ─── Shared ─────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
