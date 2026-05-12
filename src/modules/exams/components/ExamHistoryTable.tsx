import type { ExamResult } from '@/types/exams';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Download, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';

interface ExamHistoryTableProps {
  results: ExamResult[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  userRole: 'STANDARD' | 'VIP' | 'ADMIN';
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function DiffBadge({ difficulty }: { difficulty: ExamResult['difficulty'] }) {
  const map = {
    EASY: 'bg-success/10 text-success border-success/20 shadow-none',
    MEDIUM: 'bg-warning/10 text-warning border-warning/20 shadow-none',
    HARD: 'bg-destructive/10 text-destructive border-destructive/20 shadow-none',
  } as const;
  const labelMap = { EASY: 'Dễ', MEDIUM: 'TB', HARD: 'Khó' } as const;
  return <Badge className={map[difficulty]}>{labelMap[difficulty]}</Badge>;
}

export function ExamHistoryTable({ results, selectedIds, onSelect, userRole }: ExamHistoryTableProps) {
  const navigate = useNavigate();
  const isPDFDisabled = userRole === 'STANDARD';

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-10 px-4 py-3 text-left" aria-label="Chọn để so sánh" />
              <th className="px-4 py-3 text-left font-semibold text-foreground">Đề thi</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Part</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Điểm</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Đúng/Tổng</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Thời gian</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Ngày làm</th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const isSelected = selectedIds.includes(r.id);
              return (
                <tr
                  key={r.id}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors duration-150',
                    isSelected ? 'bg-primary/5' : 'hover:bg-muted/30',
                  )}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      id={`history-select-${r.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => onSelect(r.id, !!checked)}
                      aria-label={`Chọn kết quả ${r.examTitle}`}
                    />
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <span className="line-clamp-1 font-medium text-foreground">{r.examTitle}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20 shadow-none">{r.part}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-primary">{r.score}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-foreground">{r.correctQ}</span>
                    <span className="text-muted-foreground">/{r.totalQ}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {formatTime(r.timeTaken)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.submittedAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        id={`history-review-${r.id}`}
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={() => navigate(`/dashboard/results/${r.id}`)}
                      >
                        <Eye className="w-3 h-3" /> Xem lại
                      </Button>
                      <Button
                        id={`history-export-${r.id}`}
                        size="sm"
                        variant="secondary"
                        disabled={isPDFDisabled}
                        title={isPDFDisabled ? 'Nâng cấp VIP để xuất PDF' : 'Xuất báo cáo PDF'}
                        className={cn('h-8 text-xs gap-1', isPDFDisabled && 'opacity-50 cursor-not-allowed')}
                        onClick={() => {
                          if (!isPDFDisabled) {
                            // TODO: trigger PDF export
                          }
                        }}
                      >
                        <Download className="w-3 h-3" />
                        PDF
                        {isPDFDisabled && <Lock className="w-3 h-3" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
