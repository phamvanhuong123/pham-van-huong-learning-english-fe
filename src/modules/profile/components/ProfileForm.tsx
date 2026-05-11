import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { profileSchema, type ProfileFormData, type ProfileData } from '../types';

interface ProfileFormProps {
  profile: ProfileData;
  isSaving: boolean;
  onSave: (data: ProfileFormData) => void;
}

// Today's date in YYYY-MM-DD for the native date input minDate
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Convert ISO string → YYYY-MM-DD for date input
function toDateInputValue(isoStr: string | null): string {
  if (!isoStr) return '';
  return isoStr.split('T')[0];
}

export function ProfileForm({ profile, isSaving, onSave }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      targetScore: profile.targetScore,
      examDate: toDateInputValue(profile.examDate),
    },
  });

  // Reset form when profile changes (e.g. after a successful save)
  useEffect(() => {
    reset({
      name: profile.name,
      targetScore: profile.targetScore,
      examDate: toDateInputValue(profile.examDate),
    });
  }, [profile, reset]);

  return (
    <form
      id="profile-form"
      onSubmit={handleSubmit(onSave)}
      className="space-y-5"
      noValidate
    >
      {/* ── Name ── */}
      <div className="space-y-1.5">
        <Label htmlFor="profile-name">Họ và tên</Label>
        <Input
          id="profile-name"
          placeholder="Nhập tên của bạn"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'profile-name-error' : undefined}
          {...register('name')}
        />
        {errors.name && (
          <p id="profile-name-error" className="text-xs text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* ── Target Score ── */}
      <div className="space-y-1.5">
        <Label htmlFor="profile-target-score">Điểm mục tiêu TOEIC (10–990)</Label>
        <Controller
          name="targetScore"
          control={control}
          render={({ field }) => (
            <Input
              id="profile-target-score"
              type="number"
              min={10}
              max={990}
              placeholder="Ví dụ: 750"
              aria-invalid={!!errors.targetScore}
              aria-describedby={errors.targetScore ? 'profile-score-error' : undefined}
              value={field.value ?? ''}
              onChange={(e) =>
                field.onChange(e.target.value === '' ? null : Number(e.target.value))
              }
            />
          )}
        />
        {errors.targetScore && (
          <p id="profile-score-error" className="text-xs text-destructive" role="alert">
            {errors.targetScore.message}
          </p>
        )}
      </div>

      {/* ── Exam Date ── */}
      <div className="space-y-1.5">
        <Label htmlFor="profile-exam-date">Ngày thi dự kiến</Label>
        <Controller
          name="examDate"
          control={control}
          render={({ field }) => (
            <Input
              id="profile-exam-date"
              type="date"
              min={todayISO()}
              aria-invalid={!!errors.examDate}
              aria-describedby={errors.examDate ? 'profile-date-error' : undefined}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value || null)}
              className={cn(
                'cursor-pointer',
                !field.value && 'text-muted-foreground'
              )}
            />
          )}
        />
        {errors.examDate && (
          <p id="profile-date-error" className="text-xs text-destructive" role="alert">
            {errors.examDate.message}
          </p>
        )}
      </div>

      {/* ── Submit ── */}
      <Button
        id="profile-save-btn"
        type="submit"
        className="w-full font-semibold"
        disabled={isSaving || !isDirty}
        aria-label="Lưu thông tin cá nhân"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-1.5" />
        )}
        {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
      </Button>
    </form>
  );
}
