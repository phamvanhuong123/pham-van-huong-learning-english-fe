import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Trophy, RefreshCw, ArrowLeft, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlashcardView } from './FlashcardView';
import { SM2RatingButtons } from './SM2RatingButtons';
import { fetchDueVocabs, reviewVocab } from '../api/vocabApi';
import type { Vocab, SM2Rating, SessionSummary } from '../types';

export function FlashcardContainer() {
  const navigate = useNavigate();
  // ─── Query Due Vocabs ──────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['vocab', 'due'],
    queryFn: fetchDueVocabs,
    staleTime: 0, // Always fresh when starting a session
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
      setQueue(prev => {
        const next = [...prev];
        const item = next[currentIndex];
        // Don't call API immediately for 'Again', it stays in the session
        // Actually the prompt says "không gọi API ngay", so we just move it.
        next.push(item);
        return next;
      });
      // Move to next card
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

  const toggleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);


  // ─── Keyboard Shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleFlip();
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
  
  // Loading
  if (isLoading && !hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Đang tải bộ thẻ...</p>
      </div>
    );
  }

  // Finished State
  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto px-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="bg-success/10 p-6 rounded-full mb-6">
          <Trophy className="h-12 w-12 text-success" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Phiên ôn hoàn thành! 🎉</h2>
        <p className="text-muted-foreground mb-8">
          Bạn đã hoàn thành việc ôn tập {summary.total} từ vựng của hôm nay.
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
            className="flex-1 h-12"
            onClick={() => navigate('/dashboard/vocab')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Về Vocab Manager
          </Button>
          <Button 
            className="flex-1 h-12 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate(0)} // Refresh to start new session
          >
            <Layers className="mr-2 h-4 w-4" />
            Ôn tập tiếp
          </Button>
        </div>
      </div>
    );
  }

  // Empty State (No due vocabs)
  if (hasStarted && queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tuyệt vời!</h2>
        <p className="text-muted-foreground mb-6">Bạn đã hoàn thành toàn bộ mục tiêu ôn tập hôm nay.</p>
        <Button onClick={() => navigate('/dashboard/vocab')}>
          Về trang quản lý
        </Button>
      </div>
    );
  }

  // Active Session
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard/vocab')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Thoát
        </Button>
        
        <div className="flex flex-col items-end">
          <div className="text-sm font-medium text-foreground">
            Thẻ {currentIndex + 1} / {queue.length}
          </div>
          <div className="w-32 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
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
      <SM2RatingButtons 
        onRate={handleRate} 
        disabled={!isFlipped} 
      />

      {/* Tips */}
      <div className="mt-12 flex items-center gap-6 text-[11px] text-muted-foreground/60 uppercase tracking-widest font-medium border-t border-border/50 pt-6">
        <div className="flex items-center gap-1.5">
          <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border shadow-sm">Space</kbd> Lật thẻ
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border shadow-sm">1-4</kbd> Đánh giá
        </div>
      </div>
    </div>
  );
}
