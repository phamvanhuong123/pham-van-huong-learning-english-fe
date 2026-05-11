import { useQuery } from '@tanstack/react-query';
import type { ExamResult } from '../types';
import { fetchResultById } from '../api/examLibraryApi';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CompareResultDialogProps {
  resultIds: [string, string] | null;
  onClose: () => void;
}

function ScoreSummary({ result }: { result: ExamResult }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/50 border border-border">
      <span className="text-3xl font-bold text-primary">{result.score}</span>
      <span className="text-sm text-muted-foreground">
        {result.correctQ}/{result.totalQ} câu đúng
      </span>
      <span className="text-xs text-muted-foreground">
        {new Date(result.submittedAt).toLocaleDateString('vi-VN')}
      </span>
    </div>
  );
}

function CompareTable({ r1, r2 }: { r1: ExamResult; r2: ExamResult }) {
  // Build a question list from both result answers
  const allQuestionIds = new Set([
    ...Object.keys(r1.answers ?? {}),
    ...Object.keys(r2.answers ?? {}),
  ]);

  const rows = Array.from(allQuestionIds).map((qId, idx) => {
    const ans1 = r1.answers?.[qId] ?? '—';
    const ans2 = r2.answers?.[qId] ?? '—';
    const isDifferent = ans1 !== ans2;
    return { idx: idx + 1, ans1, ans2, isDifferent };
  });

  return (
    <div className="overflow-y-auto max-h-72 border border-border rounded-xl text-sm">
      <table className="w-full">
        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
          <tr className="border-b border-border">
            <th className="px-4 py-2 text-left text-muted-foreground font-medium">Câu</th>
            <th className="px-4 py-2 text-center text-muted-foreground font-medium">Lần 1</th>
            <th className="px-4 py-2 text-center text-muted-foreground font-medium">Lần 2</th>
          </tr>
        </thead>
        <tbody className="bg-card">
          {rows.map((row) => (
            <tr
              key={row.idx}
              className={cn(
                'border-b border-border last:border-0 transition-colors',
                row.isDifferent ? 'bg-yellow-50' : '',
              )}
            >
              <td
                className={cn(
                  'px-4 py-2 font-mono text-xs font-medium',
                  row.isDifferent ? 'border-l-2 border-yellow-400' : '',
                )}
              >
                #{row.idx}
              </td>
              <td
                className={cn(
                  'px-4 py-2 text-center font-mono font-semibold',
                  row.isDifferent ? 'text-warning' : 'text-foreground',
                )}
              >
                {row.ans1}
              </td>
              <td
                className={cn(
                  'px-4 py-2 text-center font-mono font-semibold',
                  row.isDifferent ? 'text-warning' : 'text-foreground',
                )}
              >
                {row.ans2}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CompareResultDialog({ resultIds, onClose }: CompareResultDialogProps) {
  const isOpen = resultIds !== null;
  const [id1, id2] = resultIds ?? ['', ''];

  const q1 = useQuery({
    queryKey: ['result', id1],
    queryFn: () => fetchResultById(id1),
    enabled: isOpen && !!id1,
    staleTime: 5 * 60 * 1000,
  });

  const q2 = useQuery({
    queryKey: ['result', id2],
    queryFn: () => fetchResultById(id2),
    enabled: isOpen && !!id2,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = q1.isLoading || q2.isLoading;
  const r1 = q1.data;
  const r2 = q2.data;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">So sánh 2 lần làm bài</DialogTitle>
          {r1 && (
            <p className="text-sm text-muted-foreground mt-1">{r1.examTitle}</p>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : r1 && r2 ? (
          <div className="flex flex-col gap-4">
            {/* Score comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Lần 1</p>
                <ScoreSummary result={r1} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Lần 2</p>
                <ScoreSummary result={r2} />
              </div>
            </div>

            {/* Diff legend */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-sm bg-yellow-100 border-l-2 border-yellow-400 inline-block" />
              <span>Câu có đáp án khác nhau giữa 2 lần làm</span>
            </div>

            {/* Answer diff table */}
            <CompareTable r1={r1} r2={r2} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Không tải được dữ liệu so sánh.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
