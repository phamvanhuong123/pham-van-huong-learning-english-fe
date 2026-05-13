import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchResults } from '@/services/examLibraryApi';
import type { FilterPart, ExamResult } from '@/types/exams';
import { ScoreLineChart } from '../components/ScoreLineChart';
import { ExamHistoryTable } from '../components/ExamHistoryTable';
import { CompareResultDialog } from '../components/CompareResultDialog';
import { ExamHistoryEmptyState } from '../components/ExamHistoryEmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, GitCompare, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';


const PART_OPTIONS: { label: string; value: FilterPart }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Part 5', value: 'PART5' },
  { label: 'Part 6', value: 'PART6' },
  { label: 'Part 7', value: 'PART7' },
];

export default function ExamHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { role: userRole } = useRole();

  const part = (searchParams.get('part') ?? 'ALL') as FilterPart;
  const page = Number(searchParams.get('page') ?? '1');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<[string, string] | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['results', { part, page }],
    queryFn: () => fetchResults({ part, page, limit: 10 }),
    staleTime: 2 * 60 * 1000,
  });

  const { data: chartData } = useQuery({
    queryKey: ['results-chart', { part }],
    queryFn: () => fetchResults({ part, limit: 100 }),
    staleTime: 2 * 60 * 1000,
  });

  const results = data?.results ?? [];
  const allResults = chartData?.results ?? [];
  const pagination = data?.pagination;

  // ─── Selection logic ─────────────────────────────────────────────────────────
  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => (prev.length >= 2 ? [prev[1], id] : [...prev, id]));
    } else {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    }
  };

  // ─── Compare logic ─────────────────────────────────────────────────────────
  const canCompare = (() => {
    if (selectedIds.length !== 2) return false;
    const r1 = results.find((r) => r.id === selectedIds[0]);
    const r2 = results.find((r) => r.id === selectedIds[1]);
    return r1 && r2 && r1.examId === r2.examId;
  })();

  const compareTooltip = (() => {
    if (selectedIds.length === 2 && !canCompare) {
      return 'Chỉ có thể so sánh 2 lần làm cùng một đề';
    }
    return undefined;
  })();

  const handleCompare = () => {
    if (canCompare && selectedIds.length === 2) {
      setCompareIds([selectedIds[0], selectedIds[1]]);
    }
  };

  // ─── URL param helpers ──────────────────────────────────────────────────────
  const handlePartChange = (v: FilterPart) => {
    const next = new URLSearchParams(searchParams);
    if (v === 'ALL') next.delete('part');
    else next.set('part', v);
    next.delete('page');
    setSearchParams(next, { replace: true });
    setSelectedIds([]);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lịch sử thi</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Xem lại các lần làm bài và theo dõi sự tiến bộ của bạn theo thời gian.
        </p>
      </div>

      {/* Score Chart */}
      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : (
        <ScoreLineChart results={allResults} />
      )}

      {/* Part filter */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {PART_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              id={`history-filter-${opt.value}`}
              onClick={() => handlePartChange(opt.value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 border',
                part === opt.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Compare button */}
        {selectedIds.length >= 2 && (
          <div className="flex items-center gap-2">
            {compareTooltip && (
              <div className="flex items-center gap-1 text-xs text-warning">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{compareTooltip}</span>
              </div>
            )}
            <Button
              id="history-compare-btn"
              variant="default"
              size="sm"
              disabled={!canCompare}
              onClick={handleCompare}
              className="gap-2"
            >
              <GitCompare className="w-4 h-4" /> So sánh
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <ExamHistoryEmptyState />
      ) : (
        <ExamHistoryTable
          results={results}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          userRole={userRole}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            id="history-prev-page"
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
                id={`history-page-${p}`}
                onClick={() => handlePageChange(p)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150',
                  p === page ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <Button
            id="history-next-page"
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

      {/* Compare Dialog */}
      <CompareResultDialog resultIds={compareIds} onClose={() => setCompareIds(null)} />
    </div>
  );
}
