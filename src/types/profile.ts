import { z } from 'zod';

// ─── Profile API shape (mirrors backend ProfileResponse) ──────────────────────
export interface ProfileData {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  targetScore: number | null;
  examDate: string | null;
  role: string;
  vipExpiresAt: string | null;
  createdAt: string;
}

// ─── Form validation schema ───────────────────────────────────────────────────
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên ít nhất 2 ký tự')
    .max(50, 'Tên tối đa 50 ký tự'),
  targetScore: z
    .number({ message: 'Vui lòng nhập điểm mục tiêu' })
    .min(10, 'Điểm tối thiểu là 10')
    .max(990, 'Điểm tối đa là 990')
    .nullable(),
  examDate: z
    .string()
    .refine(
      (val) =>
        !val ||
        new Date(val) >= new Date(new Date().toDateString()),
      'Ngày thi không được là ngày quá khứ'
    )
    .nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// ─── Crop result shape ────────────────────────────────────────────────────────
export interface CropPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropResult {
  blob: Blob;
  previewUrl: string;
}
