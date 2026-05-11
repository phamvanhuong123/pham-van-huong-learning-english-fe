import api from '@/lib/axios';
import type { ProfileData, ProfileFormData } from '../types';

// ─── GET /api/profile ─────────────────────────────────────────────────────────
export const fetchProfile = async (): Promise<ProfileData> => {
  const { data } = await api.get<ProfileData>('/profile');
  return data;
};

// ─── PATCH /api/profile ───────────────────────────────────────────────────────
export const updateProfile = async (
  payload: Partial<ProfileFormData>
): Promise<ProfileData> => {
  const { data } = await api.patch<ProfileData>('/profile', payload);
  return data;
};

// ─── POST /api/profile/avatar ─────────────────────────────────────────────────
export const uploadAvatar = async (file: Blob): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append('avatar', file, 'avatar.jpg');
  const { data } = await api.post<{ avatarUrl: string }>('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
