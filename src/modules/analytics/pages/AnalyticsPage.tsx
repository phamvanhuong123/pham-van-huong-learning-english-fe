import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/analyticsApi';
import { OverviewMetricCards } from '../components/OverviewMetricCards';
import { AccuracyLineChart } from '../components/AccuracyLineChart';
import { TopicAnalysisSection } from '../components/TopicAnalysisSection';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-100 w-full rounded-xl" />
    </div>
  );
}

export default function AnalyticsPage() {
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role ?? 'STANDARD';

  // Fetch Overview Data
  const { data: overviewData, isLoading: isLoadingOverview } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsApi.getOverview,
    staleTime: 60 * 1000,
  });

  // Fetch Progress Data
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['analytics', 'progress', 8],
    queryFn: () => analyticsApi.getProgress(8),
    staleTime: 60 * 1000,
  });

  const isLoading = isLoadingOverview || isLoadingProgress;

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Báo cáo học tập</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Tổng quan về tiến độ luyện thi và đánh giá điểm yếu để tối ưu lộ trình của bạn.
        </p>
      </div>

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {/* Section 1: Overview & Progress */}
          <section className="space-y-6" aria-label="Tổng quan hiệu suất">
            {overviewData && <OverviewMetricCards overview={overviewData} />}
            {progressData && <AccuracyLineChart progress={progressData} />}
          </section>

          {/* Section 2: Topic Analysis (VIP) */}
          <section aria-label="Phân tích điểm yếu">
            <TopicAnalysisSection userRole={userRole} />
          </section>
        </>
      )}
    </div>
  );
}
