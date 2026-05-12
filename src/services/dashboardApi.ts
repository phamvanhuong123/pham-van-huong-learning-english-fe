import api from '@/lib/axios';
import type { DashboardResponse } from '@/types/dashboard';

// ─── GET /api/dashboard ───────────────────────────────────────────────────────
export const fetchDashboard = async (): Promise<DashboardResponse> => {
  const { data } = await api.get<DashboardResponse>('/dashboard');
  return data;
};
  
