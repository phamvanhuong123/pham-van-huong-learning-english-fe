import api from '@/lib/axios';
import type {
  GetVocabsResponse,
  VocabFilter,
  Vocab,
  BulkImportResult,
  ReviewResult,
  SM2Rating,
  CSVVocabRow,
} from '@/types/vocab';

// ─── GET /api/vocab ───────────────────────────────────────────────────────────
export const fetchVocabs = async (filter: VocabFilter = {}): Promise<GetVocabsResponse> => {
  const { status, topic, search, page = 1, limit = 20 } = filter;

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (status) params.set('status', status);
  if (topic) params.set('topic', topic);
  if (search) params.set('search', search);

  const { data } = await api.get<GetVocabsResponse>(`/vocab?${params.toString()}`);
  return data;
};

// ─── PATCH /api/vocab/:vocabId ────────────────────────────────────────────────
export const updateVocab = async (
  vocabId: string,
  payload: { meaning?: string; topic?: string }
): Promise<Vocab> => {
  const { data } = await api.patch<Vocab>(`/vocab/${vocabId}`, payload);
  return data;
};

// ─── DELETE /api/vocab/:vocabId ───────────────────────────────────────────────
export const deleteVocab = async (vocabId: string): Promise<void> => {
  await api.delete(`/vocab/${vocabId}`);
};

// ─── DELETE /api/vocab/bulk ───────────────────────────────────────────────────
export const bulkDeleteVocab = async (ids: string[]): Promise<{ deleted: number }> => {
  const { data } = await api.delete<{ deleted: number }>('/vocab/bulk', { data: { ids } });
  return data;
};

// ─── POST /api/vocab/bulk-import ─────────────────────────────────────────────
export const bulkImportVocab = async (vocabs: CSVVocabRow[]): Promise<BulkImportResult> => {
  const { data } = await api.post<BulkImportResult>('/vocab/bulk-import', { vocabs });
  return data;
};

// ─── GET /api/vocab/due ───────────────────────────────────────────────────────
export const fetchDueVocabs = async (): Promise<{ dueVocabs: Vocab[]; total: number }> => {
  const { data } = await api.get<{ dueVocabs: Vocab[]; total: number }>('/vocab/due');
  return data;
};

// ─── POST /api/vocab/:vocabId/review ─────────────────────────────────────────
export const reviewVocab = async (vocabId: string, rating: SM2Rating): Promise<ReviewResult> => {
  const { data } = await api.post<ReviewResult>(`/vocab/${vocabId}/review`, { rating });
  return data;
};
