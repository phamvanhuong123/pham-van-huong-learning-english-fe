import { useParams } from 'react-router';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRole } from '@/hooks/useRole';
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
import { Menu, Loader2 } from 'lucide-react';
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

// New Components
import { PartTabs } from './components/PartTabs';
import { QuestionList } from './components/QuestionList';
import { PassageList } from './components/PassageList';
import { ExamNavigation } from './components/ExamNavigation';
import { getAvailableParts, getPartFromOrder, getQuestionsByPart } from './utils/examUtils';

export const ExamWorkspacePage = () => {
  const { examId } = useParams<{ examId: string }>();
  const { isStandard } = useRole();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'content' | 'questions'>('questions');
  
  // Tab State
  const [activePart, setActivePart] = useState<number>(1);

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

  const sortedQuestions = useMemo(() => {
    if (!exam?.questions) return [];
    return [...exam.questions].sort((a, b) => a.order - b.order);
  }, [exam?.questions]);

  const availableParts = useMemo(() => getAvailableParts(sortedQuestions), [sortedQuestions]);

  const currentQuestions = useMemo(() => 
    getQuestionsByPart(sortedQuestions, activePart), 
    [sortedQuestions, activePart]
  );

  const hasPassages = useMemo(() => {
    return currentQuestions.some(q => !!q.passageGroupId);
  }, [currentQuestions]);

  // Reset mobile tab when part changes or if part has no passages
  useEffect(() => {
    if (!hasPassages) {
      setMobileTab('questions');
    }
  }, [activePart, hasPassages]);

  const stats = useMemo(() => {
    const answeredByPart: Record<number, number> = {};
    const totalByPart: Record<number, number> = {};

    sortedQuestions.forEach(q => {
      const part = getPartFromOrder(q.order);
      totalByPart[part] = (totalByPart[part] || 0) + 1;
      if (session?.answers[q.id]) {
        answeredByPart[part] = (answeredByPart[part] || 0) + 1;
      }
    });

    return { answeredByPart, totalByPart };
  }, [sortedQuestions, session?.answers]);

  // Sync active part with first available part on load
  useEffect(() => {
    if (availableParts.length > 0 && !availableParts.includes(activePart)) {
      setActivePart(availableParts[0]);
    }
  }, [availableParts, activePart]);

  // Sync active part if redirected from palette
  const handleQuestionClick = useCallback((questionId: string) => {
    const q = sortedQuestions.find(question => question.id === questionId);
    if (q) {
      const part = getPartFromOrder(q.order);
      if (part !== activePart) {
        setActivePart(part);
      }
    }
  }, [sortedQuestions, activePart]);

  const handleNextPart = () => {
    const currentIndex = availableParts.indexOf(activePart);
    if (currentIndex < availableParts.length - 1) {
      setActivePart(availableParts[currentIndex + 1]);
      // Scroll to top of main area
      const main = document.querySelector('main');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPart = () => {
    const currentIndex = availableParts.indexOf(activePart);
    if (currentIndex > 0) {
      setActivePart(availableParts[currentIndex - 1]);
      const main = document.querySelector('main');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) return <WorkspaceSkeleton />;

  if (isError || !exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold text-destructive">Đã xảy ra lỗi</h2>
        <p className="text-muted-foreground">Không thể tải dữ liệu bài thi. Vui lòng thử lại.</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    );
  }

  const isVipPreview = exam.type === 'VIP' && isStandard;
  const answeredCount = session ? Object.keys(session.answers).length : 0;
  const progressPercent = (answeredCount / exam.questions.length) * 100;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden font-sans">
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

      <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0 z-50 relative">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-lg font-bold text-primary tracking-tight truncate hidden md:block">TOEIC Master</h1>
          <div className="h-6 w-[1px] bg-border hidden md:block"></div>
          <span className="text-sm font-semibold truncate max-w-[200px] md:max-w-[400px]">
            {exam.title}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <ExamTimer 
            duration={exam.duration} 
            examId={exam.id} 
            onTimeUp={() => submitExam('timeout')} 
            hideLabel
            className="bg-transparent p-0 min-w-0 text-xl font-bold text-primary"
          />
          <Button 
            onClick={() => submitExam('manual')}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Nộp bài"}
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 h-[2px] bg-primary/20 w-full">
           <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </header>

      {/* Part Tabs (FULL Exam only) */}
      <PartTabs 
        availableParts={availableParts}
        activePart={activePart}
        onPartChange={setActivePart}
        answeredByPart={stats.answeredByPart}
        totalByPart={stats.totalByPart}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Tab Switcher */}
        {hasPassages && (
          <div className="md:hidden absolute top-0 left-0 w-full bg-card border-b z-30 flex">
            <button 
              onClick={() => setMobileTab('content')}
              className={cn(
                "flex-1 py-3 text-sm font-bold transition-all border-b-2",
                mobileTab === 'content' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground"
              )}
            >
              Nội dung bài
            </button>
            <button 
              onClick={() => setMobileTab('questions')}
              className={cn(
                "flex-1 py-3 text-sm font-bold transition-all border-b-2",
                mobileTab === 'questions' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground"
              )}
            >
              Câu hỏi ({answeredCount}/{exam.questions.length})
            </button>
          </div>
        )}

        <main className={cn(
          "flex-1 flex overflow-hidden lg:mr-[280px]",
          hasPassages && "pt-[48px] md:pt-0" // Space for mobile tabs
        )}>
          
          {/* Left Pane: Content */}
          {hasPassages && (
            <div className={cn(
              "w-full md:w-1/2 overflow-y-auto border-r bg-muted/5 custom-scrollbar",
              mobileTab === 'content' ? "block" : "hidden md:block"
            )}>
              <PassageList 
                questions={currentQuestions} 
                examPart={exam.part} 
                isVipPreview={isVipPreview} 
              />
            </div>
          )}

          {/* Right Pane: Questions */}
          <div className={cn(
            "flex-1 overflow-y-auto bg-background custom-scrollbar",
            hasPassages && mobileTab === 'questions' ? "block" : (hasPassages ? "hidden md:block" : "block")
          )}>
            <div className={cn("flex flex-col h-full", !hasPassages && "max-w-6xl mx-auto w-full")}>
              <div className="flex-1">
                <QuestionList 
                  questions={currentQuestions}
                  examId={exam.id}
                  answers={session?.answers || {}}
                  bookmarks={session?.bookmarks || []}
                  isPending={isPending}
                  onSelectAnswer={selectAnswer}
                  onToggleBookmark={toggleBookmark}
                />
              </div>

              {/* Bottom Navigation */}
              <div className="p-8 mt-auto">
                <ExamNavigation 
                  onPrev={handlePrevPart}
                  onNext={handleNextPart}
                  hasPreviousPart={availableParts.indexOf(activePart) > 0}
                  hasNextPart={availableParts.indexOf(activePart) < availableParts.length - 1}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar: Palette */}
        <aside className="hidden lg:flex w-[280px] bg-card border-l flex-col fixed right-0 top-16 bottom-0 z-40">
           <div className="p-6 flex flex-col h-full">
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Bảng câu hỏi</h2>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tiến độ làm bài</span>
                  <span className="text-xs font-bold text-primary">{answeredCount}/{exam.questions.length}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <QuestionPalette 
                  questions={sortedQuestions} 
                  examId={exam.id} 
                  onQuestionClick={handleQuestionClick}
                />
              </div>

           </div>
        </aside>

        {/* Mobile FAB */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] flex flex-col p-0">
               <div className="p-6 border-b">
                 <h2 className="text-xl font-bold">Mục lục câu hỏi</h2>
               </div>
               <div className="flex-1 overflow-y-auto p-6">
                 <QuestionPalette 
                    questions={sortedQuestions} 
                    examId={exam.id} 
                    onNavigate={() => setIsSheetOpen(false)}
                    onQuestionClick={handleQuestionClick}
                  />
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};
