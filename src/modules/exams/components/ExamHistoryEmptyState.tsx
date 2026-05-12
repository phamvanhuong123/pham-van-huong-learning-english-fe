import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

export function ExamHistoryEmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <ClipboardList className="w-8 h-8 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">Chưa có lịch sử thi</p>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Hoàn thành bài thi đầu tiên để xem kết quả và theo dõi tiến độ của bạn.
        </p>
      </div>
      <Button
        id="history-start-first-exam-btn"
        variant="default"
        className="mt-2 gap-2"
        onClick={() => navigate('/exams')}
      >
        Bắt đầu bài thi đầu tiên
      </Button>
    </div>
  );
}
