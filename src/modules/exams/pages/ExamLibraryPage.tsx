import { useSearchParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchExams } from '@/services/examLibraryApi';
import type { FilterPart, FilterDifficulty, FilterType } from '@/types/exams';
import { ExamFilterBar } from '../components/ExamFilterBar';
import { ExamCard } from '../components/ExamCard';
import { VIPLockModal } from '../components/VIPLockModal';
import { ExamLibraryEmptyState } from '../components/ExamLibraryEmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useExamStore } from '@/modules/workspace/store/useExamStore';
const useUserRole = () => ({ role: 'STANDARD' as 'STANDARD' | 'VIP' | 'ADMIN' });
export default function ExamLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role: userRole } = useUserRole();
  const sessions = useExamStore((state) => state.sessions);


  const part = (searchParams.get('part') ?? 'ALL') as FilterPart;
  const difficulty = (searchParams.get('difficulty') ?? 'ALL') as FilterDifficulty;
  const type = (searchParams.get('type') ?? 'ALL') as FilterType;
  const page = Number(searchParams.get('page') ?? '1');

  const [lockedExamId, setLockedExamId] = useState<string | null>(null);
``
  const { data, isLoading } = useQuery({
    queryKey: ['exams', { part, difficulty, type, page }],
    queryFn: () => fetchExams({ part, difficulty, type, page, limit: 12 }),
    staleTime: 2 * 60 * 1000,
  });

  const exams = data?.exams ?? [];
  const pagination = data?.pagination;
  const hasActiveFilter = part !== 'ALL' || difficulty !== 'ALL' || type !== 'ALL';

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'ALL') next.delete(key);
    else next.set(key, value);
    next.delete('page'); // reset page khi đổi filter
    setSearchParams(next, { replace: true });
  };

  const handleReset = () => setSearchParams({}, { replace: true });

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next, { replace: true });
  };

  const handleVIPLockClick = (examId: string) => setLockedExamId(examId);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Thư viện đề thi</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Luyện tập TOEIC Part 5, 6, 7 với bộ đề đa dạng từ dễ đến khó.
        </p>
      </div>

      {/* Filter Bar */}
      <ExamFilterBar
        part={part}
        difficulty={difficulty}
        type={type}
        onPartChange={(v) => updateParam('part', v)}
        onDifficultyChange={(v) => updateParam('difficulty', v)}
        onTypeChange={(v) => updateParam('type', v)}
        onReset={handleReset}
      />

      {/* Results count */}
      {!isLoading && pagination && (
        <p className="text-sm text-muted-foreground">
          Hiển thị <span className="font-medium text-foreground">{exams.length}</span> / {pagination.total} đề thi
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-2xl" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <ExamLibraryEmptyState hasActiveFilter={hasActiveFilter} onReset={handleReset} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              variant="library"
              id={exam.id}
              title={exam.title}
              part={exam.part}
              difficulty={exam.difficulty}
              type={exam.type}
              totalQuestions={exam.totalQuestions}
              duration={exam.duration}
              userBestScore={exam.userBestScore}
              userRole={userRole}
              hasSession={!!sessions[exam.id]}
              onVIPLockClick={handleVIPLockClick}
              onStart={(id) => navigate(`/workspace/${id}`)}
              onRetry={(id) => {
                useExamStore.getState().clearSession(id);
                navigate(`/workspace/${id}`);
              }}
              onViewResult={() => navigate(`/history`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <Button
            id="exam-library-prev-page"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Trước
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                id={`exam-library-page-${p}`}
                onClick={() => handlePageChange(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150 ${
                  p === page
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            id="exam-library-next-page"
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="gap-1"
          >
            Sau <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* VIP Lock Modal */}
      <VIPLockModal examId={lockedExamId} onClose={() => setLockedExamId(null)} />
    </div>
  );
}
