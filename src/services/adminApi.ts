import api from '@/lib/axios';
import type { 
  AdminDashboardData, 
  AdminUsersResponse, 
  UserUpdateBody,
  AdminSubscriptionsResponse,
  SubscriptionUpdateBody,
  QuestionCreateBody,
  QuestionUpdateBody
} from '@/types/admin';

export const adminApi = {
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

  getExams: async () => {
    const { data } = await api.get('/admin/exams');
    return data;
  },
};



