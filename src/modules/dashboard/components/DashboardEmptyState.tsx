import { useNavigate } from 'react-router';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 flex flex-col items-center justify-center text-center gap-5">
      {/* Illustration */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ClipboardList className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-warning/20 border-2 border-warning/40 flex items-center justify-center">
          <span className="text-warning text-xs font-bold">0</span>
        </div>
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-foreground">Chưa có bài thi nào</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Bắt đầu bài thi đầu tiên để xem thống kê tiến độ học tập của bạn tại đây.
        </p>
      </div>

      {/* CTA */}
      <Button
        id="dashboard-empty-start-exam-btn"
        onClick={() => navigate('/exams')}
        className="font-semibold"
        aria-label="Đi đến thư viện bài thi"
      >
        Bắt đầu bài thi đầu tiên
        <ArrowRight className="h-4 w-4 ml-1.5" />
      </Button>
    </div>
  );
}
