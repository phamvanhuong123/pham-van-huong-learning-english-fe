import api from '@/lib/axios';
import type { 
  AdminDashboardData, 
  AdminUsersResponse, 
  UserUpdateBody,
  AdminSubscriptionsResponse,
  SubscriptionUpdateBody,
  QuestionCreateBody,
  QuestionUpdateBody,
  AdminExamsResponse,
  ExamCreateBody,
  ExamUpdateBody,
  PassageGroup,
  PassageGroupCreateBody,
} from '@/types/admin';

export const adminApi = {
  getPassageGroups: async (examId: string): Promise<PassageGroup[]> => {
    const { data } = await api.get<PassageGroup[]>(`/admin/passage-groups/${examId}`);
    return data;
  },

  createPassageGroup: async (body: PassageGroupCreateBody): Promise<PassageGroup> => {
    const { data } = await api.post<PassageGroup>('/admin/passage-groups', body);
    return data;
  },

  updatePassageGroup: async (id: string, body: { passages: any[] }): Promise<PassageGroup> => {
    const { data } = await api.patch<PassageGroup>(`/admin/passage-groups/${id}`, body);
    return data;
  },

  getDashboard: async (): Promise<AdminDashboardData> => {
    const { data } = await api.get<AdminDashboardData>('/admin/dashboard');
    return data;
  },

  getUsers: async (params: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminUsersResponse> => {
    const { data } = await api.get<AdminUsersResponse>('/admin/users', { params });
    return data;
  },

  updateUser: async (params: { userId: string; body: UserUpdateBody }): Promise<void> => {
    await api.patch(`/admin/users/${params.userId}`, params.body);
  },

  getSubscriptions: async (params: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminSubscriptionsResponse> => {
    const { data } = await api.get<AdminSubscriptionsResponse>('/admin/subscriptions', { params });
    return data;
  },

  updateSubscription: async (params: { subId: string; body: SubscriptionUpdateBody }): Promise<void> => {
    await api.patch(`/admin/subscriptions/${params.subId}`, params.body);
  },

  deleteSubscription: async (subId: string): Promise<void> => {
    await api.delete(`/admin/subscriptions/${subId}`);
  },

  // ─── Questions ─────────────────────────────────────────────────────────────

  getQuestions: async (params?: any) => {
    const { data } = await api.get('/admin/questions', { params });
    return data;
  },

  createQuestion: async (body: QuestionCreateBody) => {
    const { data } = await api.post('/admin/questions', body);
    return data;
  },

  updateQuestion: async ({ id, body }: { id: string; body: QuestionUpdateBody }) => {
    const { data } = await api.patch(`/admin/questions/${id}`, body);
    return data;
  },

  deleteQuestion: async (id: string) => {
    await api.delete(`/admin/questions/${id}`);
  },

  getExams: async (): Promise<AdminExamsResponse> => {
    const { data } = await api.get<AdminExamsResponse>('/admin/exams');
    return data;
  },

  createExam: async (body: ExamCreateBody) => {
    const { data } = await api.post('/admin/exams', body);
    return data;
  },

  updateExam: async ({ id, body }: { id: string; body: ExamUpdateBody }) => {
    const { data } = await api.patch(`/admin/exams/${id}`, body);
    return data;
  },

  broadcastNotification: async (body: { title: string; body: string; targetRole: 'ALL' | 'STANDARD' | 'VIP' }) => {
    const { data } = await api.post('/admin/notifications/broadcast', body);
    return data;
  },
};



