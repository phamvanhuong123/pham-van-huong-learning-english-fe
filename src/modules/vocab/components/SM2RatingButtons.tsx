
import { cn } from '@/lib/utils';
import type { SM2Rating, VocabSchedule } from '@/types/vocab';

interface SM2RatingButtonsProps {
  onRate: (rating: SM2Rating) => void;
  disabled?: boolean;
  schedule?: VocabSchedule | null;
}

export function SM2RatingButtons({ onRate, disabled = false, schedule }: SM2RatingButtonsProps) {
  // Helper to calculate next interval preview based on standard SM-2
  const getIntervalPreview = (rating: SM2Rating) => {
    if (!schedule) return rating === 0 ? '<1m' : '1d';
    
    const ef = schedule.ef || 2.5;
    const interval = schedule.interval || 0;
    const repetitions = schedule.repetitions || 0;

    if (rating === 0) return '<1m';
    if (rating === 1) return '1d';
    
    if (repetitions === 0) return '1d';
    if (repetitions === 1) return '6d';
    
    const nextInterval = Math.round(interval * ef * (rating === 3 ? 1.3 : 1));
    return `${nextInterval}d`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Again - 0 */}
      <button
        className={cn(
          "flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all duration-300 border-2",
          "bg-white hover:bg-destructive/5 border-transparent hover:border-destructive/30",
          disabled && "opacity-20 cursor-not-allowed pointer-events-none"
        )}
        onClick={() => onRate(0)}
        disabled={disabled}
      >
        <span className="text-[11px] font-bold text-destructive/60 uppercase tracking-wider mb-1">Again</span>
        <span className="text-lg font-bold text-destructive">{getIntervalPreview(0)}</span>
      </button>

      {/* Hard - 1 */}
      <button
        className={cn(
          "flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all duration-300 border-2",
          "bg-white hover:bg-orange-500/5 border-transparent hover:border-orange-500/30",
          disabled && "opacity-20 cursor-not-allowed pointer-events-none"
        )}
        onClick={() => onRate(1)}
        disabled={disabled}
      >
        <span className="text-[11px] font-bold text-orange-500/60 uppercase tracking-wider mb-1">Hard</span>
        <span className="text-lg font-bold text-orange-500">{getIntervalPreview(1)}</span>
      </button>

      {/* Good - 2 */}
      <button
        className={cn(
          "flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all duration-300 border-2",
          "bg-white hover:bg-green-600/5 border-transparent hover:border-green-600/30",
          disabled && "opacity-20 cursor-not-allowed pointer-events-none"
        )}
        onClick={() => onRate(2)}
        disabled={disabled}
      >
        <span className="text-[11px] font-bold text-green-600/60 uppercase tracking-wider mb-1">Good</span>
        <span className="text-lg font-bold text-green-600">{getIntervalPreview(2)}</span>
      </button>

      {/* Easy - 3 */}
      <button
        className={cn(
          "flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all duration-300 border-2",
          "bg-white hover:bg-blue-600/5 border-transparent hover:border-blue-600/30",
          disabled && "opacity-20 cursor-not-allowed pointer-events-none"
        )}
        onClick={() => onRate(3)}
        disabled={disabled}
      >
        <span className="text-[11px] font-bold text-blue-600/60 uppercase tracking-wider mb-1">Easy</span>
        <span className="text-lg font-bold text-blue-600">{getIntervalPreview(3)}</span>
      </button>
    </div>
  );
}
