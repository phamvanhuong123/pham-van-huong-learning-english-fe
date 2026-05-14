import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Trophy, RefreshCw, ArrowLeft, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlashcardView } from './FlashcardView';
import { SM2RatingButtons } from './SM2RatingButtons';
import { fetchDueVocabs, reviewVocab } from '@/services/vocabApi';
import type { Vocab, SM2Rating, SessionSummary } from '@/types/vocab';
import { cn } from '@/lib/utils';

export function FlashcardContainer() {
  const navigate = useNavigate();
  // ─── Query Due Vocabs ──────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['vocab', 'due'],
    queryFn: fetchDueVocabs,
    staleTime: 0,
  });

  // ─── Local Session State ──────────────────────────────────────────────────
  const [queue, setQueue] = useState<Vocab[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [summary, setSummary] = useState<SessionSummary>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    total: 0,
  });
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Initialize queue once data is loaded
  useEffect(() => {
    if (data?.dueVocabs && !hasStarted) {
      setQueue(data.dueVocabs);
      setHasStarted(true);
      setSummary(prev => ({ ...prev, total: data.dueVocabs.length }));
    }
  }, [data, hasStarted]);

  // ─── Review Mutation ──────────────────────────────────────────────────────
  const { mutate: doReview } = useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: SM2Rating }) => reviewVocab(id, rating),
    onError: (err) => {
      console.error('Review failed:', err);
      toast.error('Lưu kết quả thất bại, nhưng phiên vẫn tiếp tục');
    }
  });

  // ─── Logic ─────────────────────────────────────────────────────────────────
  const currentVocab = queue[currentIndex];

  const toggleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleRate = useCallback((rating: SM2Rating) => {
    if (!currentVocab || !isFlipped) return;

    // Update Summary
    setSummary(prev => ({
      ...prev,
      again: rating === 0 ? prev.again + 1 : prev.again,
      hard: rating === 1 ? prev.hard + 1 : prev.hard,
      good: rating === 2 ? prev.good + 1 : prev.good,
      easy: rating === 3 ? prev.easy + 1 : prev.easy,
    }));

    if (rating === 0) {
      // "Again" Logic: Move to the end of the current queue
      // Don't call API yet, it will be reviewed again in this session
      setQueue(prev => {
        const next = [...prev];
        const item = next[currentIndex];
        next.push(item);
        return next;
      });
      
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Hard (1), Good (2), Easy (3) logic: Call API and move on
      doReview({ id: currentVocab.id, rating });
      
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        setIsFinished(true);
      }
    }
  }, [currentVocab, currentIndex, isFlipped, queue, doReview]);


  // ─── Keyboard Shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!isFlipped) {
          toggleFlip();
        }
      } else if (isFlipped) {
        if (e.key === '1') handleRate(0);
        else if (e.key === '2') handleRate(1);
        else if (e.key === '3') handleRate(2);
        else if (e.key === '4') handleRate(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isFinished, handleRate, toggleFlip]);

  // ─── Render States ────────────────────────────────────────────────────────
  
  if (isLoading && !hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Đang tải bộ thẻ...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto px-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="bg-success/10 p-6 rounded-full mb-6">
          <Trophy className="h-12 w-12 text-success" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Phiên ôn hoàn thành! 🎉</h2>
        <p className="text-muted-foreground mb-8">
          Bạn đã ôn tập xong {summary.total} từ vựng của hôm nay.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-10">
          <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-4">
            <div className="text-destructive font-bold text-2xl">{summary.again}</div>
            <div className="text-[10px] uppercase text-destructive/60 tracking-wider">Again</div>
          </div>
          <div className="bg-warning/5 border border-warning/10 rounded-xl p-4">
            <div className="text-warning font-bold text-2xl">{summary.hard}</div>
            <div className="text-[10px] uppercase text-warning/60 tracking-wider">Hard</div>
          </div>
          <div className="bg-success/5 border border-success/10 rounded-xl p-4">
            <div className="text-success font-bold text-2xl">{summary.good}</div>
            <div className="text-[10px] uppercase text-success/60 tracking-wider">Good</div>
          </div>
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
            <div className="text-primary font-bold text-2xl">{summary.easy}</div>
            <div className="text-[10px] uppercase text-primary/60 tracking-wider">Easy</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            variant="outline" 
            className="flex-1 h-12 rounded-xl"
            onClick={() => navigate('/vocab')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Về Vocab Manager
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate(0)}
          >
            <Layers className="mr-2 h-4 w-4" />
            Tiếp tục ôn tập
          </Button>
        </div>
      </div>
    );
  }

  if (hasStarted && queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tuyệt vời!</h2>
        <p className="text-muted-foreground mb-6">Bạn đã hoàn thành toàn bộ mục tiêu ôn tập hôm nay.</p>
        <Button onClick={() => navigate('/vocab')} className="rounded-xl px-8">
          Về trang quản lý
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-12">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/vocab')}
          className="text-muted-foreground hover:text-foreground rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Thoát
        </Button>
        
        <div className="flex flex-col items-end gap-2">
          <div className="text-sm font-bold text-foreground/70 uppercase tracking-widest">
            {currentIndex + 1} / {queue.length}
          </div>
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden border border-border/10">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard Area */}
      {currentVocab && (
        <FlashcardView 
          vocab={currentVocab} 
          isFlipped={isFlipped} 
          onFlip={toggleFlip}
        />
      )}

      {/* Ratings Area */}
      <div className={cn(
        "w-full transition-all duration-500",
        isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      )}>
        <SM2RatingButtons 
          onRate={handleRate} 
          disabled={!isFlipped} 
          schedule={currentVocab?.schedule}
        />
      </div>

      {!isFlipped && (
        <div className="mt-12 animate-bounce">
          <Button 
            variant="secondary" 
            className="rounded-full px-12 h-14 text-lg font-bold shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={toggleFlip}
          >
            Show Answer
          </Button>
        </div>
      )}

      {/* Tips */}
      <div className="mt-20 flex items-center gap-8 text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] font-bold">
        <div className="flex items-center gap-2">
          <kbd className="bg-muted px-2 py-1 rounded-md border border-border shadow-sm">Space</kbd> Lật thẻ
        </div>
        <div className="flex items-center gap-2">
          <kbd className="bg-muted px-2 py-1 rounded-md border border-border shadow-sm">1-4</kbd> Đánh giá
        </div>
      </div>
    </div>
  );
}
