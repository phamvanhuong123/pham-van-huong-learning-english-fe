import { useParams } from 'react-router';
import { useState } from 'react';
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
import { Menu, Flag as FlagIcon, Loader2 } from 'lucide-react';
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

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Question Area */}
        <div className="space-y-6">
          {exam.questions.map((q) => {
            const selectedOptionId = session?.answers[q.id] || null;
            const isBookmarked = session?.bookmarks.includes(q.id);

            return (
              <div key={q.id} id={`question-${q.id}`} className="bg-card border border-border rounded-lg p-6 shadow-sm scroll-mt-24">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {q.order}
                      </span>
                      <p className="text-lg font-medium pt-1">{q.questionText}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleBookmark(exam.id, q.id)}
                      className={cn(
                        "h-8 w-8",
                        isBookmarked ? "text-warning hover:text-warning" : "text-muted-foreground"
                      )}
                    >
                      <FlagIcon className={cn("h-5 w-5", isBookmarked && "fill-warning")} />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-4 ml-11">
                    {q.passage && (
                      <div className="p-4 bg-muted rounded-md text-base leading-relaxed passage-content whitespace-pre-wrap border-l-4 border-primary/20">
                        {q.passage}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-3">
                      {q.options.map((opt) => {
                        const isSelected = selectedOptionId === opt.id;
                        return (
                          <Button
                            key={opt.id}
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => selectAnswer(exam.id, q.id, opt.id)}
                            disabled={isPending}
                            className={cn(
                              "justify-start h-auto py-3 px-4 text-left font-normal border-border transition-all",
                              isSelected ? "bg-primary text-primary-foreground shadow-md" : "bg-transparent hover:bg-muted hover:border-primary/50"
                            )}
                          >
                            <span className={cn(
                              "font-bold mr-3 w-6 h-6 rounded-full flex items-center justify-center border",
                              isSelected ? "bg-white text-primary border-white" : "bg-muted text-muted-foreground border-border"
                            )}>
                              {opt.label}
                            </span>
                            {opt.text}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Mục lục câu hỏi</h2>
            <QuestionPalette 
              questions={exam.questions} 
              examId={exam.id} 
            />
          </div>
        </div>

        {/* Sidebar Mobile (Sheet) */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] overflow-y-auto">
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-6">Mục lục câu hỏi</h2>
                <QuestionPalette 
                  questions={exam.questions} 
                  examId={exam.id} 
                  onNavigate={() => setIsSheetOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};
