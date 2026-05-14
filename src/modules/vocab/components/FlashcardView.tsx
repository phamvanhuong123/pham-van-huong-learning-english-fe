import { cn } from '@/lib/utils';
import type { Vocab } from '@/types/vocab';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';

interface FlashcardViewProps {
  vocab: Vocab;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashcardView({ vocab, isFlipped, onFlip }: FlashcardViewProps) {
  const playAudio = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (vocab.audioUrl) {
      const audio = new Audio(vocab.audioUrl);
      audio.play().catch(console.error);
    } else {
      const utterance = new SpeechSynthesisUtterance(vocab.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [vocab.word, vocab.audioUrl]);

  return (
    <div 
      className="perspective-1000 w-full max-w-xl aspect-[16/10] cursor-pointer group relative"
      onClick={onFlip}
    >
      <div 
        className={cn(
          "relative w-full h-full transition-transform duration-700 preserve-3d shadow-2xl rounded-3xl",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden bg-card border-2 border-border/50 rounded-3xl flex flex-col items-center justify-center p-12 text-center group-hover:border-primary/20 transition-all duration-300">
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-6 opacity-40">
            {vocab.topic || 'General Vocabulary'}
          </div>
          
          <div className="relative group/word">
            <h2 className="text-5xl font-extrabold text-foreground tracking-tight mb-3">
              {vocab.word}
            </h2>
            {vocab.phonetic && (
              <div className="text-xl font-medium text-primary/60 font-mono tracking-wide">
                {vocab.phonetic}
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="mt-6 rounded-full hover:bg-primary/10 text-primary/40 hover:text-primary transition-all duration-300"
              onClick={playAudio}
            >
              <Volume2 className="h-6 w-6" />
            </Button>
          </div>

          <div className="absolute bottom-10 left-0 right-0 text-[11px] text-muted-foreground/30 font-medium uppercase tracking-widest animate-pulse">
            Click to reveal answer
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-background border-2 border-primary/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-3">
              <div className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] opacity-60">Definition</div>
              <p className="text-3xl font-bold text-foreground leading-tight">
                {vocab.meaning}
              </p>
            </div>
            
            {vocab.example && (
              <div className="space-y-3 pt-8 border-t border-border/40">
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-40">Usage Example</div>
                <p className="text-base text-muted-foreground italic leading-relaxed font-serif bg-muted/30 p-5 rounded-2xl border border-border/20">
                  "{vocab.example}"
                </p>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-full border-primary/20 text-primary/60 hover:text-primary hover:bg-primary/5 h-8 px-4"
              onClick={playAudio}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Listen again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
