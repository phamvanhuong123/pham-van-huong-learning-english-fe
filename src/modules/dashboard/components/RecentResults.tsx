import { useNavigate } from 'react-router';
import { ClipboardList, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecentResultsProps } from '../types';

const PART_LABEL: Record<string, string> = {
  PART5: 'Part 5',
  PART6: 'Part 6',
  PART7: 'Part 7',
  FULL: 'Full Test',
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function RecentResults({ recentResults }: RecentResultsProps) {
  const navigate = useNavigate();

  if (recentResults.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">3 bài thi gần nhất</h2>
      </div>

      <div className="space-y-3">
        {recentResults.map((result) => {
          const accuracyPct = Math.round((result.correctQ / result.totalQ) * 100);
          const isGood = accuracyPct >= 70;

          return (
            <button
              key={result.id}
              id={`recent-result-${result.id}`}
              className="w-full text-left rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors duration-150 p-4 flex items-center justify-between gap-4 group"
              onClick={() => navigate(`/dashboard/results/${result.id}`)}
              aria-label={`Xem chi tiết kết quả: ${result.exam.title}`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{result.exam.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                    {PART_LABEL[result.exam.part] ?? result.exam.part}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(result.submittedAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{result.score} điểm</p>
                  <p
                    className={cn(
                      'text-xs font-medium',
                      isGood ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {result.correctQ}/{result.totalQ} câu ({accuracyPct}%)
                  </p>
                </div>
                <div>
                  {isGood ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
