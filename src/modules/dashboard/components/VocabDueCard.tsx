import { useNavigate } from 'react-router';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VocabDueCardProps } from '@/types/dashboard';

export function VocabDueCard({ vocabDueToday }: VocabDueCardProps) {
  const navigate = useNavigate();

  // Only render when there are due vocabs
  if (vocabDueToday === 0) return null;

  return (
    <div
      className="rounded-xl border-2 border-warning/40 bg-warning/5 p-5 flex items-center justify-between gap-4"
      role="alert"
      aria-label="Từ vựng cần ôn hôm nay"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-warning/15">
          <BookOpen className="h-5 w-5 text-warning" />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {vocabDueToday} từ cần ôn hôm nay
          </p>
          <p className="text-sm text-muted-foreground">
            Đừng để quên — ôn tập giúp ghi nhớ lâu hơn!
          </p>
        </div>
      </div>
      <Button
        id="vocab-due-review-btn"
        className="shrink-0 bg-warning text-warning-foreground hover:bg-warning/90 font-semibold"
        onClick={() => navigate('/vocab/practice')}
        aria-label="Bắt đầu ôn tập từ vựng"
      >
        Ôn ngay
        <ArrowRight className="h-4 w-4 ml-1.5" />
      </Button>
    </div>
  );
}
