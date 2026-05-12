import { cn } from '@/lib/utils';
import type { Vocab } from '@/types/vocab';

interface FlashcardViewProps {
  vocab: Vocab;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashcardView({ vocab, isFlipped, onFlip }: FlashcardViewProps) {
  return (
    <div 
      className="perspective-1000 w-full max-w-lg aspect-[3/2] cursor-pointer group"
      onClick={onFlip}
    >
      <div 
        className={cn(
          "relative w-full h-full transition-transform duration-500 preserve-3d shadow-xl rounded-2xl",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden bg-card border-2 border-border rounded-2xl flex flex-col items-center justify-center p-8 text-center group-hover:border-primary/30 transition-colors">
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-4 opacity-60">
            {vocab.topic || 'General'}
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2 selection:bg-primary/20">
            {vocab.word}
          </h2>
          <div className="mt-8 text-xs text-muted-foreground animate-pulse">
            Nhấn để lật hoặc dùng Space
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-accent text-accent-foreground rounded-2xl flex flex-col items-center justify-center p-8 text-center border-2 border-accent/20">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-widest opacity-70">Nghĩa</div>
              <p className="text-2xl font-semibold leading-tight">
                {vocab.meaning}
              </p>
            </div>
            
            {vocab.example && (
              <div className="space-y-1 pt-4 border-t border-white/10">
                <div className="text-xs uppercase tracking-widest opacity-70">Ví dụ</div>
                <p className="text-sm font-mono italic leading-relaxed bg-black/5 p-3 rounded-lg">
                  "{vocab.example}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
