import { useNavigate } from 'react-router';
import { BookMarked, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GrammarPracticeCard() {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5 flex items-center justify-between gap-4"
      aria-label="Luyện tập ngữ pháp"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/15">
          <BookMarked className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            Luyện tập Ngữ pháp
          </p>
          <p className="text-sm text-muted-foreground">
            Củng cố kiến thức với ngân hàng câu hỏi đa dạng.
          </p>
        </div>
      </div>
      <Button
        id="grammar-practice-btn"
        className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        onClick={() => navigate('/grammar')}
        aria-label="Bắt đầu luyện tập ngữ pháp"
      >
        Luyện ngay
        <ArrowRight className="h-4 w-4 ml-1.5" />
      </Button>
    </div>
  );
}
