import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { ArrowRight, Settings, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchDashboard } from '@/services/dashboardApi';
import { StatsGrid } from './StatsGrid';
import { VocabDueCard } from './VocabDueCard';
import { AccuracyByPartSection } from './AccuracyByPartSection';
import { RecentResults } from './RecentResults';
import { DashboardEmptyState } from './DashboardEmptyState';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import api from '@/lib/axios';

// ─── Greeting logic (local time) ─────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Chào buổi sáng';
  if (hour >= 12 && hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function formatDaysUntil(examDateIso: string): number | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDateIso);
  exam.setHours(0, 0, 0, 0);
  const diff = Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

interface ProfileData {
  targetScore: number | null;
  examDate: string | null;
  name: string;
}

export function DashboardContainer() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);

  // Fetch profile for targetScore & examDate (lightweight query)
  const { data: profile } = useQuery<ProfileData>({
    queryKey: ['profile', 'mini'],
    queryFn: async () => {
      const { data } = await api.get<ProfileData>('/profile');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const userName = profile?.name || authUser?.name || 'bạn';
  const targetScore = profile?.targetScore ?? null;
  const examDate = profile?.examDate ?? null;


  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 60 * 1000, // 1 minute
  });

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <p className="font-semibold text-destructive">Không thể tải dữ liệu Dashboard</p>
        <p className="text-sm text-muted-foreground mt-1">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  const { stats, recentResults } = data;
  const hasExams = stats.totalExamsDone > 0;
  const daysUntil = examDate ? formatDaysUntil(examDate) : null;
  const missingGoal = !targetScore || !examDate;

  return (
    <div className="space-y-6 pb-10">
      {/* ── Greeting Section ── */}
      <section aria-label="Lời chào">
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, <span className="text-primary">{userName}</span>! 
        </h1>

        {/* Countdown to exam */}
        {daysUntil !== null && (
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {daysUntil === 0
              ? 'Hôm nay là ngày thi! Chúc bạn thành công '
              : `Còn ${daysUntil} ngày đến kỳ thi`}
          </p>
        )}

        {/* Missing goal prompt */}
        {missingGoal && (
          <button
            id="dashboard-set-goal-btn"
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            onClick={() => navigate('/dashboard/profile')}
            aria-label="Đặt mục tiêu điểm và ngày thi"
          >
            <Settings className="h-3.5 w-3.5" />
            {!targetScore && !examDate
              ? 'Đặt mục tiêu điểm & ngày thi →'
              : !targetScore
              ? 'Đặt mục tiêu điểm →'
              : 'Đặt ngày thi →'}
          </button>
        )}
      </section>

      {/* ── Main content: conditional on hasExams ── */}
      {hasExams ? (
        <>
          {/* Stats Grid 2×2 */}
          <section aria-label="Thống kê học tập">
            <StatsGrid stats={stats} />
          </section>

          {/* Vocab Due Card — only if vocabDueToday > 0 */}
          {stats.vocabDueToday > 0 && (
            <section aria-label="Từ vựng cần ôn">
              <VocabDueCard vocabDueToday={stats.vocabDueToday} />
            </section>
          )}

          {/* Accuracy By Part */}
          <section aria-label="Accuracy theo Part">
            <AccuracyByPartSection accuracyByPart={stats.accuracyByPart} />
          </section>

          {/* Recent Results */}
          <section aria-label="Bài thi gần nhất">
            <RecentResults recentResults={recentResults} />
          </section>
        </>
      ) : (
        <>
          {/* Show vocab due card even when no exams */}
          {stats.vocabDueToday > 0 && (
            <section aria-label="Từ vựng cần ôn">
              <VocabDueCard vocabDueToday={stats.vocabDueToday} />
            </section>
          )}

          {/* Empty state */}
          <section aria-label="Trạng thái trống">
            <DashboardEmptyState />
          </section>
        </>
      )}

      {/* ── CTA Button ── */}
      <div className="pt-2">
        <Button
          id="dashboard-start-exam-btn"
          className="w-full font-semibold text-base py-6"
          onClick={() => navigate('/exams')}
          aria-label="Bắt đầu bài thi mới"
        >
          Bắt đầu bài thi mới
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
