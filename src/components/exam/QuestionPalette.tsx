import React from 'react';
import { useExamStore } from '@/modules/workspace/store/useExamStore';
import { cn } from '@/lib/utils';
import { Flag } from 'lucide-react';
import type { Question } from '@/types/workspace';

interface QuestionPaletteProps {
  questions: Question[];
  examId: string;
  onNavigate?: () => void; // Dùng để đóng Sheet trên mobile
  onQuestionClick?: (questionId: string) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({ questions, examId, onNavigate, onQuestionClick }) => {
  const session = useExamStore((state) => state.sessions[examId]);
  
  const answers = session?.answers || {};
  const bookmarks = session?.bookmarks || [];

  const answeredCount = Object.keys(answers).filter(id => answers[id] !== null).length;
  const bookmarkCount = bookmarks.length;

  const handleScrollToQuestion = (questionId: string) => {
    // Gọi callback nếu có
    if (onQuestionClick) {
      onQuestionClick(questionId);
    }

    // Mobile: Đóng Sheet trước
    if (onNavigate) {
      onNavigate();
    }

    // Scroll mượt đến câu hỏi
    // Timeout nhỏ để đảm bảo component đã được render nếu có chuyển Part/Tab
    setTimeout(() => {
      const element = document.getElementById(`question-${questionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="text-sm font-medium text-muted-foreground">
        Đã làm: <span className="text-foreground">{answeredCount}/{questions.length}</span> câu 
        {' · '} 
        Đánh dấu: <span className="text-warning">{bookmarkCount}</span> câu
      </div>

      {/* Grid Palette */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, index) => {
          const isAnswered = !!answers[q.id];
          const isBookmarked = bookmarks.includes(q.id);

          return (
            <button
              key={q.id}
              onClick={() => handleScrollToQuestion(q.id)}
              className={cn(
                "w-9 h-9 rounded-md text-xs font-bold flex items-center justify-center transition-all relative",
      
                "bg-muted text-muted-foreground hover:ring-2 hover:ring-primary/50",
           
                isAnswered && "bg-primary text-primary-foreground",
            
                isBookmarked && "bg-muted text-muted-foreground border-2 border-yellow-400"
              )}
            >
              {index + 1}
              {isBookmarked && (
                <Flag className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 fill-yellow-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
