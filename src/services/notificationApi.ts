import axiosInstance from '../lib/axios';
import type { NotificationListResponse, ReadAllResponse } from '@/types/notification';

export const notificationApi = {
  getList: async (page = 1, limit = 10): Promise<NotificationListResponse> => {
    const response = await axiosInstance.get<NotificationListResponse>('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  readAll: async (): Promise<ReadAllResponse> => {
    const response = await axiosInstance.post<ReadAllResponse>('/notifications/read-all');
    return response.data;
  },
};
