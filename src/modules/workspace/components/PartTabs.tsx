
import { cn } from '@/lib/utils';
import { TOEIC_PART_RANGES } from '../utils/examUtils';

interface PartTabsProps {
  availableParts: number[];
  activePart: number;
  onPartChange: (part: number) => void;
  answeredByPart: Record<number, number>;
  totalByPart: Record<number, number>;
}

export const PartTabs = ({
  availableParts,
  activePart,
  onPartChange,
  answeredByPart,
  totalByPart,
}: PartTabsProps) => {
  if (availableParts.length <= 1) return null;

  return (
    <div className="bg-card border-b sticky top-0 z-30 overflow-x-auto no-scrollbar">
      <div className="flex px-4 md:px-8">
        {availableParts.map((partNum) => {
          const isActive = activePart === partNum;
          const answered = answeredByPart[partNum] || 0;
          const total = totalByPart[partNum] || 0;
          const isCompleted = answered === total && total > 0;

          return (
            <button
              key={partNum}
              onClick={() => onPartChange(partNum)}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-6 min-w-[100px] border-b-2 transition-all relative whitespace-nowrap",
                isActive 
                  ? "border-primary text-primary bg-primary/5" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider mb-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                Part {partNum}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium opacity-70">
                  {answered}/{total}
                </span>
                {isCompleted && (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
