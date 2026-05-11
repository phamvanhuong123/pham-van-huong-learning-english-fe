import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { fetchProfile, updateProfile, uploadAvatar } from '../api/profileApi';
import { AvatarUploader } from './AvatarUploader';
import { ProfileForm } from './ProfileForm';
import { VIPStatusCard } from './VIPStatusCard';
import { ExamCountdown } from './ExamCountdown';
import type { ProfileFormData } from '../types';

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-20 rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );
}

export function ProfileContainer() {
  const queryClient = useQueryClient();
  const authUser = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);

  // Optimistic avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const previousAvatarUrl = useRef<string | null>(null);

  // ── Fetch profile ─────────────────────────────────────────────────────────
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  });

  // ── Update profile mutation ────────────────────────────────────────────────
  const { mutate: doUpdateProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: (data: Partial<ProfileFormData>) => updateProfile(data),
    onSuccess: (updated) => {
      toast.success('Đã lưu thông tin thành công!');
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['profile', 'mini'] });
      // Update auth store name if changed
      if (authUser && updated.name !== authUser.name) {
        setAuth({ ...authUser, name: updated.name }, useAuthStore.getState().accessToken ?? '');
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message ?? 'Lưu thất bại. Vui lòng thử lại.';
      toast.error(msg);
    },
  });

  // ── Upload avatar mutation ─────────────────────────────────────────────────
  const { mutate: doUploadAvatar, isPending: isUploadingAvatar } = useMutation({
    mutationFn: (blob: Blob) => uploadAvatar(blob),
    onSuccess: (result) => {
      toast.success('Đã cập nhật ảnh đại diện!');
      setAvatarPreview(null); // clear local preview; real URL from server
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Update auth store avatarUrl
      if (authUser) {
        setAuth(
          { ...authUser, avatarUrl: result.avatarUrl },
          useAuthStore.getState().accessToken ?? ''
        );
      }
    },
    onError: () => {
      toast.error('Upload ảnh thất bại. Ảnh cũ được giữ nguyên.');
      // Revert optimistic preview
      setAvatarPreview(null);
    },
  });

  // ── Avatar crop complete handler ───────────────────────────────────────────
  const handleCropComplete = useCallback(
    (blob: Blob, localPreview: string) => {
      // Save current URL for potential revert
      previousAvatarUrl.current = profile?.avatarUrl ?? null;
      // Optimistic update
      setAvatarPreview(localPreview);
      // Fire upload
      doUploadAvatar(blob);
    },
    [doUploadAvatar, profile?.avatarUrl]
  );

  // ── Form save handler ──────────────────────────────────────────────────────
  const handleFormSave = useCallback(
    (data: ProfileFormData) => {
      const payload: Partial<ProfileFormData> = {};
      if (data.name !== profile?.name) payload.name = data.name;
      if (data.targetScore !== profile?.targetScore) payload.targetScore = data.targetScore;

      // Normalize examDate: convert YYYY-MM-DD → ISO string for backend
      const normalizedExamDate = data.examDate ? `${data.examDate}T00:00:00.000Z` : null;
      const profileExamDate = profile?.examDate ? profile.examDate.split('T')[0] : null;
      if (data.examDate !== profileExamDate) payload.examDate = normalizedExamDate;

      if (Object.keys(payload).length === 0) return;
      doUpdateProfile(payload);
    },
    [doUpdateProfile, profile]
  );

  // ── Loading / error states ─────────────────────────────────────────────────
  if (isLoading) return <ProfileSkeleton />;

  if (isError || !profile) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <p className="font-semibold text-destructive">Không thể tải thông tin cá nhân</p>
        <p className="text-sm text-muted-foreground mt-1">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Avatar ── */}
      <div className="flex flex-col items-center py-2">
        <AvatarUploader
          currentAvatarUrl={profile.avatarUrl}
          previewUrl={avatarPreview}
          isUploading={isUploadingAvatar}
          onCropComplete={handleCropComplete}
        />
      </div>

      {/* ── Email (read-only) ── */}
      <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Email</span>
        <span className="text-sm font-medium text-foreground">{profile.email}</span>
      </div>

      {/* ── Exam countdown ── */}
      <ExamCountdown examDate={profile.examDate} />

      {/* ── VIP status ── */}
      <VIPStatusCard role={profile.role} vipExpiresAt={profile.vipExpiresAt} />

      {/* ── Profile form ── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Thông tin học tập</h2>
        <ProfileForm
          profile={profile}
          isSaving={isSavingProfile}
          onSave={handleFormSave}
        />
      </div>

      {/* ── Account info (read-only) ── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-base font-semibold text-foreground">Thông tin tài khoản</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ngày tham gia</span>
            <span className="font-medium text-foreground">
              {new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(new Date(profile.createdAt))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phân quyền</span>
            <span className="font-medium text-foreground capitalize">{profile.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
