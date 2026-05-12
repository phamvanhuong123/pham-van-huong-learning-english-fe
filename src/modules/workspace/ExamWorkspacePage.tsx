import { useParams } from 'react-router';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { useExamStore } from './store/useExamStore';
import { fetchExamById } from '@/services/workspaceExamApi';
import { WorkspaceSkeleton } from './components/WorkspaceSkeleton';
import { ExamTimer } from '@/components/exam/ExamTimer';
import { QuestionPalette } from '@/components/exam/QuestionPalette';
import { VocabPopup } from '@/components/vocab/VocabPopup';
import { useTextSelection } from '@/hooks/useTextSelection';
import { useSubmitExam } from '@/hooks/useSubmitExam';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Flag as FlagIcon, Loader2, BookOpen, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ExamWorkspacePage = () => {
  const { examId } = useParams<{ examId: string }>();
  const user = useAuthStore((state) => state.user);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { text: selectedText, example: selectionExample, rect: selectionRect, clearSelection } = useTextSelection();

  // Store actions
  const selectAnswer = useExamStore((state) => state.selectAnswer);
  const toggleBookmark = useExamStore((state) => state.toggleBookmark);
  const session = useExamStore((state) => state.sessions[examId!]);

  const {
    data: exam,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => fetchExamById(examId!),
    enabled: !!examId,
  });

  // Submit Hook
  const {
    submitExam,
    executeSubmit,
    isPending,
    showConfirmModal,
    setShowConfirmModal,
    confirmMessage,
  } = useSubmitExam({
    examId: examId!,
    totalQuestions: exam?.questions.length || 0,
    duration: exam?.duration || 0,
  });

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  if (isError || !exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold text-destructive">Đã xảy ra lỗi</h2>
        <p className="text-muted-foreground">Không thể tải dữ liệu bài thi. Vui lòng thử lại.</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    );
  }

  const isVipPreview = exam.type === 'VIP' && user?.role === 'STANDARD';

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 relative">
      {/* Vocab Popup */}
      {selectedText && selectionRect && (
        <VocabPopup 
          word={selectedText} 
          example={selectionExample}
          rect={selectionRect} 
          onClose={clearSelection} 
        />
      )}

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận nộp bài</AlertDialogTitle>
            <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                executeSubmit();
              }}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Nộp bài
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header with Title & Timer */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-card border border-border p-4 rounded-lg shadow-sm sticky top-0 z-20">
        <div>
          <h1 className="text-xl md:text-2xl font-bold line-clamp-1">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">
            {exam.part} • {exam.questions.length} câu hỏi • {exam.difficulty}
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <ExamTimer 
            duration={exam.duration} 
            examId={exam.id} 
            onTimeUp={() => submitExam('timeout')} 
          />
          <Button 
            variant="default" 
            className="bg-primary hover:bg-primary/90"
            onClick={() => submitExam('manual')}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Nộp bài
          </Button>
        </div>
      </div>

      {isVipPreview && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-warning font-medium">
            Đây là đề thi VIP. Bạn đang xem trước 3 câu đầu tiên.
          </p>
          <Button variant="default" className="bg-warning hover:bg-warning/90 text-white">
            Nâng cấp VIP để xem đầy đủ
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Question Area */}
        <div className="lg:col-span-8 space-y-8">
          {(() => {
            // Logic gộp nhóm câu hỏi theo passageGroupId
            const groups: { passageGroup: any; questions: typeof exam.questions }[] = [];
            exam.questions.forEach((q) => {
              const lastGroup = groups[groups.length - 1];
              if (lastGroup && q.passageGroupId && lastGroup.passageGroup?.id === q.passageGroupId) {
                lastGroup.questions.push(q);
              } else {
                groups.push({ passageGroup: q.passageGroup || null, questions: [q] });
              }
            });

            return groups.map((group, gIdx) => (
              <div 
                key={gIdx} 
                className={cn(
                  "bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md",
                  group.passageGroup ? "border-l-4 border-l-primary" : ""
                )}
              >
                {/* Passage Section */}
                {group.passageGroup && group.passageGroup.passages && group.passageGroup.passages.length > 0 && (
                  <div className="bg-muted/30 p-4 md:p-8 border-b border-border/50">
                    <div className="space-y-6">
                      {group.passageGroup.passages
                        .sort((a: any, b: any) => a.order - b.order)
                        .map((p: any) => (
                          <div key={p.id} className="space-y-4">
                            <div className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 opacity-80">
                              <BookOpen className="w-4 h-4" /> 
                              {group.passageGroup.passages.length > 1 ? `Đoạn văn ${p.order}` : 'Nội dung bài đọc'}
                            </div>
                            <div className="text-base md:text-lg leading-relaxed whitespace-pre-wrap passage-content font-serif text-foreground/90">
                              {p.content}
                            </div>
                            {p.mediaUrl && (
                              <div className="mt-4 rounded-xl overflow-hidden border border-border bg-white p-2">
                                <img src={p.mediaUrl} alt="Passage illustration" className="w-full h-auto object-contain" />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Questions Section */}
                <div className="divide-y divide-border/50">
                  {group.questions.map((q, qIdx) => {
                    const selectedOptionId = session?.answers[q.id] || null;
                    const isBookmarked = session?.bookmarks.includes(q.id);

                    return (
                      <div
                        key={q.id}
                        id={`question-${q.id}`}
                        className={cn(
                          "p-4 md:p-8 scroll-mt-32 transition-colors",
                          selectedOptionId ? "bg-primary/[0.02]" : "bg-transparent"
                        )}
                      >
                        <div className="flex flex-col gap-6">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm shadow-primary/20 text-sm md:text-base">
                                {q.order}
                              </div>
                              <h3 className="text-base md:text-lg font-semibold text-foreground pt-1.5 leading-snug">
                                {q.questionText}
                              </h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleBookmark(exam.id, q.id)}
                              className={cn(
                                "h-10 w-10 shrink-0 rounded-full transition-all",
                                isBookmarked 
                                  ? "bg-warning/10 text-warning hover:bg-warning/20" 
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                            >
                              <FlagIcon className={cn("h-5 w-5", isBookmarked && "fill-warning")} />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:ml-14">
                            {q.options.map((opt) => {
                              const isSelected = selectedOptionId === opt.id;
                              return (
                                <Button
                                  key={opt.id}
                                  variant={isSelected ? "default" : "outline"}
                                  onClick={() => selectAnswer(exam.id, q.id, opt.id)}
                                  disabled={isPending}
                                  className={cn(
                                    "justify-start h-auto py-4 px-5 text-left font-medium border-border/60 transition-all rounded-xl relative overflow-hidden group",
                                    isSelected
                                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-primary/10 border-primary"
                                      : "bg-background hover:bg-primary/5 hover:border-primary/30"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "font-bold mr-4 w-7 h-7 rounded-lg flex items-center justify-center border text-xs shrink-0 transition-colors",
                                      isSelected
                                        ? "bg-white text-primary border-white"
                                        : "bg-muted text-muted-foreground border-border group-hover:border-primary/30"
                                    )}
                                  >
                                    {opt.label}
                                  </div>
                                  <span className="text-sm md:text-base">{opt.text}</span>
                                  {isSelected && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
                                      <Loader2 className="w-8 h-8 rotate-45" />
                                    </div>
                                  )}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Sidebar Desktop */}
        <div className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-28 bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Menu className="w-5 h-5 text-primary" />
              Mục lục câu hỏi
            </h2>
            <div className="max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
              <QuestionPalette 
                questions={exam.questions} 
                examId={exam.id} 
              />
            </div>
            
            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Thời gian còn lại</span>
                <div className="font-mono font-bold text-primary text-lg">
                  <ExamTimer 
                    duration={exam.duration} 
                    examId={exam.id} 
                    onTimeUp={() => submitExam('timeout')} 
                    hideLabel
                    className="bg-transparent px-0 min-w-0 text-primary"
                  />
                </div>
              </div>
              <Button 
                variant="default" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-base font-bold shadow-lg shadow-primary/20 rounded-xl"
                onClick={() => submitExam('manual')}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                Nộp bài thi ngay
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Mobile (Sheet) */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground animate-bounce-subtle">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border bg-muted/20">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Menu className="w-6 h-6 text-primary" />
                  Mục lục câu hỏi
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <QuestionPalette 
                  questions={exam.questions} 
                  examId={exam.id} 
                  onNavigate={() => setIsSheetOpen(false)}
                />
              </div>
              <div className="p-6 border-t border-border bg-card">
                <Button 
                  variant="default" 
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-bold rounded-xl shadow-xl shadow-primary/20"
                  onClick={() => {
                    setIsSheetOpen(false);
                    submitExam('manual');
                  }}
                  disabled={isPending}
                >
                  Nộp bài thi
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};
