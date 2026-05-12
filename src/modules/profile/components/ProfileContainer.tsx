import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LogOut, Settings, User, Shield, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { fetchProfile, updateProfile, uploadAvatar } from '@/services/profileApi';
import { AvatarUploader } from './AvatarUploader';
import { ProfileForm } from './ProfileForm';
import { VIPStatusCard } from './VIPStatusCard';
import { ExamCountdown } from './ExamCountdown';
import type { ProfileFormData } from '@/types/profile';
import { useLogout } from '@/hooks/useLogout';

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <aside className="lg:col-span-3 space-y-6">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </aside>
      <main className="lg:col-span-9 rounded-2xl border border-border bg-card shadow-sm overflow-hidden p-8 space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </main>
    </div>
  );
}

export function ProfileContainer() {
  const queryClient = useQueryClient();
  const authUser = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { handleLogout, isLoggingOut } = useLogout();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const previousAvatarUrl = useRef<string | null>(null);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: doUpdateProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: (data: Partial<ProfileFormData>) => updateProfile(data),
    onSuccess: (updated) => {
      toast.success('Đã lưu thông tin thành công!');
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['profile', 'mini'] });
      if (authUser && updated.name !== authUser.name) {
        setAuth({ ...authUser, name: updated.name }, useAuthStore.getState().accessToken ?? '');
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message ?? 'Lưu thất bại. Vui lòng thử lại.';
      toast.error(msg);
    },
  });

  const { mutate: doUploadAvatar, isPending: isUploadingAvatar } = useMutation({
    mutationFn: (blob: Blob) => uploadAvatar(blob),
    onSuccess: (result) => {
      toast.success('Đã cập nhật ảnh đại diện!');
      setAvatarPreview(null);
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (authUser) {
        setAuth({ ...authUser, avatarUrl: result.avatarUrl }, useAuthStore.getState().accessToken ?? '');
      }
    },
    onError: () => {
      toast.error('Upload ảnh thất bại. Ảnh cũ được giữ nguyên.');
      setAvatarPreview(null);
    },
  });

  const handleCropComplete = useCallback(
    (blob: Blob, localPreview: string) => {
      previousAvatarUrl.current = profile?.avatarUrl ?? null;
      setAvatarPreview(localPreview);
      doUploadAvatar(blob);
    },
    [doUploadAvatar, profile?.avatarUrl]
  );

  const handleFormSave = useCallback(
    (data: ProfileFormData) => {
      const payload: Partial<ProfileFormData> = {};
      if (data.name !== profile?.name) payload.name = data.name;
      if (data.targetScore !== profile?.targetScore) payload.targetScore = data.targetScore;

      const normalizedExamDate = data.examDate ? `${data.examDate}T00:00:00.000Z` : null;
      const profileExamDate = profile?.examDate ? profile.examDate.split('T')[0] : null;
      if (data.examDate !== profileExamDate) payload.examDate = normalizedExamDate;

      if (Object.keys(payload).length === 0) return;
      doUpdateProfile(payload);
    },
    [doUpdateProfile, profile]
  );

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ── SIDEBAR (Bên trái) ── */}
      <aside className="lg:col-span-3 space-y-6">
        {/* Profile Summary Card */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center shadow-sm">
          <img 
            src={profile.avatarUrl || '/default-avatar.png'} 
            className="w-20 h-20 rounded-full border-4 border-background object-cover shadow-sm mb-4" 
            alt="Avatar"
          />
          <h2 className="font-bold text-lg">{profile.name}</h2>
          <p className="text-xs text-muted-foreground break-all">{profile.email}</p>
        </div>

        {/* Menu Navigation */}
        <nav className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <button className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium bg-primary/10 text-primary border-l-4 border-primary">
            <Settings className="w-4 h-4" /> Chung
          </button>
          <button className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            <User className="w-4 h-4" /> Hồ sơ
          </button>
          <button className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            <Shield className="w-4 h-4" /> Bảo mật
          </button>
          <button className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            <ShoppingBag className="w-4 h-4" /> Mua hàng
          </button>
          <div className="border-t border-border mt-2 p-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive gap-3 px-3" 
              onClick={handleLogout} 
              disabled={isLoggingOut}
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </Button>
          </div>
        </nav>
      </aside>

      {/* ── MAIN CONTENT (Bên phải) ── */}
      <main className="lg:col-span-9 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Header Content */}
        <div className="p-8 border-b border-border bg-muted/20">
          <h1 className="text-2xl font-bold text-foreground">Cài đặt tài khoản</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý thông tin cá nhân và tùy chọn của bạn</p>
        </div>

        {/* Body Content: Split into Form and Avatar */}
        <div className="p-8 grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Left: Form Fields (8/12) */}
          <div className="xl:col-span-8 space-y-8">
            {/* VIP & Exam Date (Highlights) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <VIPStatusCard role={profile.role} vipExpiresAt={profile.vipExpiresAt} />
               <ExamCountdown examDate={profile.examDate} />
            </div>

            <ProfileForm 
              profile={profile} 
              isSaving={isSavingProfile} 
              onSave={handleFormSave} 
            />
          </div>

          {/* Right: Avatar Uploader (4/12) */}
          <div className="xl:col-span-4 flex flex-col items-center">
            <div className="sticky top-8 space-y-4 text-center">
              <Label className="text-base font-bold">Ảnh đại diện</Label>
              <AvatarUploader
                currentAvatarUrl={profile.avatarUrl}
                previewUrl={avatarPreview}
                isUploading={isUploadingAvatar}
                onCropComplete={handleCropComplete}
              />
              <p className="text-sm text-muted-foreground mt-4">
                Kích thước khuyến nghị: 400x400px.<br/>Hỗ trợ JPG, PNG, WebP.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
