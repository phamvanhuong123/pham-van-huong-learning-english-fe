import api from '@/lib/axios';
import type { OverviewData, ProgressData, TopicsData } from '@/types/analytics';

export const analyticsApi = {
  getOverview: async (): Promise<OverviewData> => {
    const { data } = await api.get<OverviewData>('/analytics/overview');
    return data;
  },

  getProgress: async (weeks: number = 8): Promise<ProgressData> => {
    const { data } = await api.get<ProgressData>('/analytics/progress', {
      params: { weeks },
    });
    return data;
  },

  getTopics: async (): Promise<TopicsData> => {
    const { data } = await api.get<TopicsData>('/analytics/topics');
    return data;
  },
};
