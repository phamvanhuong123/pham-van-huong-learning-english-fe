import type { QuestionCreateBody, QuestionOption } from '@/types/admin';

interface QuestionPreviewProps {
  question: Partial<QuestionCreateBody>;
}

export function QuestionPreview({ question }: QuestionPreviewProps) {
  return (
    <div className="border border-border rounded-lg bg-card p-6 overflow-hidden max-w-[800px] w-full mx-auto">
      <div className="flex flex-col gap-6">
        {/* Header giả lập */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-md">
              Câu {question.order || '#'}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              Chủ đề: {question.grammarTopic || 'Chưa phân loại'}
            </span>
          </div>
          <div className="text-xs font-semibold px-2 py-1 rounded-md bg-muted text-muted-foreground">
            {question.difficulty === 'EASY'
              ? 'Dễ'
              : question.difficulty === 'MEDIUM'
              ? 'Trung bình'
              : question.difficulty === 'HARD'
              ? 'Khó'
              : 'N/A'}
          </div>
        </div>

        {/* Passage Groups nếu có */}
        {question.passageGroup && question.passageGroup.passages && (
          <div className="space-y-4">
            {question.passageGroup.passages.map((p: any) => (
              <div key={p.id} className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm leading-relaxed whitespace-pre-wrap border-l-4 border-primary/30">
                <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">
                  Đoạn văn {question.passageGroup.passages.length > 1 ? p.order : ''}
                </div>
                {p.content}
                {p.mediaUrl && (
                  <img src={p.mediaUrl} alt="Passage" className="mt-2 rounded max-w-full h-auto border" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Question Text */}
        <div className="text-base font-medium text-foreground whitespace-pre-wrap">
          {question.questionText || 'Chưa nhập nội dung câu hỏi'}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {(question.options || []).map((opt: QuestionOption, idx: number) => {
            const isCorrect = opt.isCorrect;
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                  isCorrect
                    ? 'border-success bg-success/10 text-success'
                    : 'border-border bg-background text-foreground'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold flex-shrink-0 mt-0.5 ${
                    isCorrect
                      ? 'border-success bg-success text-white'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {opt.label || String.fromCharCode(65 + idx)}
                </div>
                <div className="text-sm pt-0.5">
                  {opt.text || <span className="italic opacity-50">Chưa nhập</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {question.explanation && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-sm font-semibold text-primary mb-2">Giải thích:</div>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {question.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
