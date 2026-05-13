import api from '@/lib/axios';
import { SubscriptionStatus } from '@/types/admin';

export interface UserSubscriptionItem {
  id: string;
  plan: '1m' | '3m' | '12m';
  status: SubscriptionStatus;
  proofUrl: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export const subscriptionApi = {
  createRequest: async (plan: string, file: File): Promise<UserSubscriptionItem> => {
    const formData = new FormData();
    formData.append('plan', plan);
    formData.append('proof', file);

    const { data } = await api.post<UserSubscriptionItem>('/subscriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  getHistory: async (): Promise<UserSubscriptionItem[]> => {
    const { data } = await api.get<UserSubscriptionItem[]>('/subscriptions/me');
    return data;
  },

  getPendingStatus: async (): Promise<UserSubscriptionItem | null> => {
    const { data } = await api.get<UserSubscriptionItem | null>('/subscriptions/pending');
    return data;
  },
};
