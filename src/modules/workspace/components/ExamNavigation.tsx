
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExamNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  isFirstPart?: boolean;
  isLastPart?: boolean;
  hasPreviousPart?: boolean;
  hasNextPart?: boolean;
}

export const ExamNavigation = ({
  onPrev,
  onNext,
  hasPreviousPart,
  hasNextPart,
}: ExamNavigationProps) => {
  return (
    <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
      <Button 
        variant="outline" 
        className="w-full sm:w-auto gap-2 rounded-full px-6"
        onClick={onPrev}
        disabled={!hasPreviousPart}
      >
        <ChevronLeft className="w-4 h-4" /> Part trước
      </Button>
      <Button 
        className="w-full sm:w-auto gap-2 rounded-full px-8 bg-primary hover:bg-primary/90"
        onClick={onNext}
        disabled={!hasNextPart}
      >
        Part tiếp theo <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
