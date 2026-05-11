import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamCountdownProps {
  examDate: string | null;
}

function getDaysUntil(examDateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDateIso);
  exam.setHours(0, 0, 0, 0);
  return Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function ExamCountdown({ examDate }: ExamCountdownProps) {
  if (!examDate) return null;

  const days = getDaysUntil(examDate);
  const isPast = days < 0;
  const isUrgent = days >= 0 && days <= 30;

  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(examDate));

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-3 text-sm border',
        isPast
          ? 'bg-destructive/5 border-destructive/20'
          : isUrgent
          ? 'bg-warning/5 border-warning/20'
          : 'bg-muted/50 border-border'
      )}
      role="status"
      aria-label="Đếm ngược ngày thi"
    >
      <Calendar
        className={cn(
          'h-4 w-4 shrink-0',
          isPast ? 'text-destructive' : isUrgent ? 'text-warning' : 'text-muted-foreground'
        )}
      />
      {isPast ? (
        <span className="font-semibold text-destructive">
          Kỳ thi đã qua — cập nhật ngày thi mới
        </span>
      ) : (
        <span
          className={cn(
            isUrgent ? 'font-semibold text-warning' : 'text-muted-foreground'
          )}
        >
          Còn <strong>{days}</strong> ngày đến kỳ thi ({formattedDate})
        </span>
      )}
    </div>
  );
}
