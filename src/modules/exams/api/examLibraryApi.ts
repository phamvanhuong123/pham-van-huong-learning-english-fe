import api from '@/lib/axios';
import type {
  ExamListResponse,
  ExamListItem,
  ResultListResponse,
  ExamResult,
  FilterPart,
  FilterDifficulty,
  FilterType,
} from '../types';

// ─── Exam Library API ──────────────────────────────────────────────────────────

export interface FetchExamsParams {
  part?: FilterPart;
  difficulty?: FilterDifficulty;
  type?: FilterType;
  page?: number;
  limit?: number;
}

export const fetchExams = async (params: FetchExamsParams): Promise<ExamListResponse> => {
  const cleanParams: Record<string, string | number> = { page: params.page ?? 1, limit: params.limit ?? 12 };
  if (params.part && params.part !== 'ALL') cleanParams.part = params.part;
  if (params.difficulty && params.difficulty !== 'ALL') cleanParams.difficulty = params.difficulty;
  if (params.type && params.type !== 'ALL') cleanParams.type = params.type;

  const { data } = await api.get<ExamListResponse>('/exams', { params: cleanParams });
  return data;
};

export const fetchExamPreview = async (examId: string): Promise<ExamListItem> => {
  const { data } = await api.get<ExamListItem>(`/exams/${examId}`);
  return data;
};

// ─── Exam Results / History API ────────────────────────────────────────────────

export interface FetchResultsParams {
  part?: FilterPart;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const fetchResults = async (params: FetchResultsParams): Promise<ResultListResponse> => {
  const cleanParams: Record<string, string | number> = { page: params.page ?? 1, limit: params.limit ?? 10 };
  if (params.part && params.part !== 'ALL') cleanParams.part = params.part;
  if (params.from) cleanParams.from = params.from;
  if (params.to) cleanParams.to = params.to;

  const { data } = await api.get<ResultListResponse>('/results', { params: cleanParams });
  return data;
};

export const fetchResultById = async (resultId: string): Promise<ExamResult> => {
  const { data } = await api.get<ExamResult>(`/results/${resultId}`);
  return data;
};
