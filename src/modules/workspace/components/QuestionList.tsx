
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Flag as FlagIcon } from 'lucide-react';
import type { Question } from '@/types/workspace';

interface QuestionListProps {
  questions: Question[];
  examId: string;
  answers: Record<string, string | null>;
  bookmarks: string[];
  isPending: boolean;
  onSelectAnswer: (examId: string, questionId: string, optionId: string) => void;
  onToggleBookmark: (examId: string, questionId: string) => void;
}

export const QuestionList = ({
  questions,
  examId,
  answers,
  bookmarks,
  isPending,
  onSelectAnswer,
  onToggleBookmark,
}: QuestionListProps) => {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
      {questions.map((q) => {
        const selectedOptionId = answers[q.id] || null;
        const isBookmarked = bookmarks.includes(q.id);

        return (
          <div
            key={q.id}
            id={`question-${q.id}`}
            className="bg-card rounded-xl border p-6 shadow-sm scroll-mt-24 transition-all hover:border-primary/30"
          >
            <div className="flex items-start gap-4 mb-6">
              <span className="bg-primary text-primary-foreground w-9 h-9 rounded-md flex items-center justify-center font-bold shrink-0 text-sm shadow-sm">
                {q.order}
              </span>
              <div className="flex-1">
                <p className="text-base font-semibold leading-snug">
                  {q.metadata?.hideQuestionText ? (
                    <span className="text-muted-foreground italic font-normal">Nội dung câu hỏi không được ghi trong đề</span>
                  ) : q.questionText}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleBookmark(examId, q.id)}
                className={cn(
                  "h-8 w-8 shrink-0 rounded-full",
                  isBookmarked ? "text-warning hover:text-warning/80" : "text-muted-foreground"
                )}
              >
                <FlagIcon className={cn("h-4 w-4", isBookmarked && "fill-warning")} />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={cn(
                      "flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/20 hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      name={`q-${q.id}`}
                      checked={isSelected}
                      onChange={() => onSelectAnswer(examId, q.id, opt.id)}
                      disabled={isPending}
                    />
                    <span className={cn(
                      "flex items-center justify-center w-6 h-6 rounded border font-bold text-xs mr-3 shrink-0",
                      isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
                    )}>
                      {opt.label}
                    </span>
                    {!q.metadata?.hideOptionsText && (
                      <span className="text-sm font-medium">{opt.text}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
