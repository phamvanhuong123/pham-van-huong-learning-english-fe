import { BookOpen, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExamLibraryEmptyStateProps {
  hasActiveFilter: boolean;
  onReset: () => void;
}

export function ExamLibraryEmptyState({ hasActiveFilter, onReset }: ExamLibraryEmptyStateProps) {
  if (hasActiveFilter) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <FilterX className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">Không tìm thấy đề thi</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Không có đề thi nào phù hợp với bộ lọc hiện tại.
          </p>
        </div>
        <Button
          id="library-reset-filter-btn"
          variant="outline"
          className="gap-2 mt-2"
          onClick={onReset}
        >
          <FilterX className="w-4 h-4" /> Xóa bộ lọc
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">Chưa có đề thi nào</p>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Hệ thống chưa có đề thi. Vui lòng quay lại sau.
        </p>
      </div>
    </div>
  );
}
