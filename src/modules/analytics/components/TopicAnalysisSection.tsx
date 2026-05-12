import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/analyticsApi';
import { TopicBarChart } from './TopicBarChart';
import { TopicTable } from './TopicTable';
import { VIPUpgradeOverlay } from './VIPUpgradeOverlay';
import { MOCK_TOPICS } from '@/types/analytics';
import { Skeleton } from '@/components/ui/skeleton';

interface TopicAnalysisSectionProps {
  userRole: string;
}

export function TopicAnalysisSection({ userRole }: TopicAnalysisSectionProps) {
  const isVIP = userRole === 'VIP' || userRole === 'ADMIN';

  // Luôn luôn fetch data, không phụ thuộc vào role
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'topics'],
    queryFn: analyticsApi.getTopics,
    // Nếu Standard user bị 403, lỗi này sẽ im lặng (hoặc log ra), 
    // ta vẫn render UI bằng MOCK_TOPICS cho phần bị blur
    retry: false, // không retry nếu bị 403
  });

  const topics = data?.topics ?? MOCK_TOPICS;

  return (
    <div className="relative">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">Phân tích chủ đề ngữ pháp</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi độ chính xác của bạn trên từng dạng câu hỏi để tập trung cải thiện.
        </p>
      </div>

      {isLoading && isVIP ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="relative">
          <div
            className={
              !isVIP
                ? 'filter blur-[6px] pointer-events-none select-none opacity-80'
                : ''
            }
          >
            <div className="space-y-6">
              <TopicBarChart topics={topics} />
              <TopicTable topics={topics} />
            </div>
          </div>

          {!isVIP && <VIPUpgradeOverlay />}
        </div>
      )}
    </div>
  );
}
