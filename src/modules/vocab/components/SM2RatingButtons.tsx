import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SM2Rating } from '@/types/vocab';

interface SM2RatingButtonsProps {
  onRate: (rating: SM2Rating) => void;
  disabled?: boolean;
}

export function SM2RatingButtons({ onRate, disabled = false }: SM2RatingButtonsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mx-auto mt-8">
      {/* Again - 0 */}
      <Button
        variant="default"
        className={cn(
          "h-12 text-white font-semibold transition-all duration-200 bg-destructive hover:bg-destructive/90 shadow-sm",
          disabled && "opacity-50 grayscale cursor-not-allowed"
        )}
        onClick={() => onRate(0)}
        disabled={disabled}
        id="rate-again-btn"
      >
        Again
        <span className="ml-1.5 text-[10px] opacity-70 bg-black/10 px-1.5 py-0.5 rounded border border-white/20">1</span>
      </Button>

      {/* Hard - 1 */}
      <Button
        variant="default"
        className={cn(
          "h-12 text-white font-semibold transition-all duration-200 bg-warning hover:bg-warning/90 shadow-sm",
          disabled && "opacity-50 grayscale cursor-not-allowed"
        )}
        onClick={() => onRate(1)}
        disabled={disabled}
        id="rate-hard-btn"
      >
        Hard
        <span className="ml-1.5 text-[10px] opacity-70 bg-black/10 px-1.5 py-0.5 rounded border border-white/20">2</span>
      </Button>

      {/* Good - 2 */}
      <Button
        variant="default"
        className={cn(
          "h-12 text-white font-semibold transition-all duration-200 bg-success hover:bg-success/90 shadow-sm",
          disabled && "opacity-50 grayscale cursor-not-allowed"
        )}
        onClick={() => onRate(2)}
        disabled={disabled}
        id="rate-good-btn"
      >
        Good
        <span className="ml-1.5 text-[10px] opacity-70 bg-black/10 px-1.5 py-0.5 rounded border border-white/20">3</span>
      </Button>

      {/* Easy - 3 */}
      <Button
        variant="default"
        className={cn(
          "h-12 text-primary-foreground font-semibold transition-all duration-200 bg-primary hover:bg-primary/90 shadow-sm",
          disabled && "opacity-50 grayscale cursor-not-allowed"
        )}
        onClick={() => onRate(3)}
        disabled={disabled}
        id="rate-easy-btn"
      >
        Easy
        <span className="ml-1.5 text-[10px] opacity-70 bg-black/10 px-1.5 py-0.5 rounded border border-white/20">4</span>
      </Button>
    </div>
  );
}
