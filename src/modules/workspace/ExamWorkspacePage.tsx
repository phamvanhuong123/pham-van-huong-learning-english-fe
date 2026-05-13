import { useParams } from 'react-router';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRole } from '@/hooks/useRole';
import { useExamStore } from './store/useExamStore';
import { fetchExamById } from '@/services/workspaceExamApi';
import { WorkspaceSkeleton } from './components/WorkspaceSkeleton';
import { ExamTimer } from '@/components/exam/ExamTimer';
import { QuestionPalette } from '@/components/exam/QuestionPalette';
import { AudioPlayer } from '@/components/exam/AudioPlayer';
import { VocabPopup } from '@/components/vocab/VocabPopup';
import { useTextSelection } from '@/hooks/useTextSelection';
import { useSubmitExam } from '@/hooks/useSubmitExam';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Flag as FlagIcon, Loader2, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const { isStandard } = useRole();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'content' | 'questions'>('questions');

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

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

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

  
      <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0 z-50 relative">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-lg font-bold text-primary tracking-tight truncate hidden md:block">TOEIC Master</h1>
          <div className="h-6 w-[1px] bg-border hidden md:block"></div>
          <span className="text-sm font-semibold truncate max-w-[200px] md:max-w-[400px]">
            {exam.title}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <ExamTimer 
              duration={exam.duration} 
              examId={exam.id} 
              onTimeUp={() => submitExam('timeout')} 
              hideLabel
              className="bg-transparent p-0 min-w-0 text-xl font-bold text-primary"
            />
          </div>
          <Button 
            onClick={() => submitExam('manual')}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-white font-bold h-10 px-6 rounded-full"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Nộp bài"}
          </Button>
        </div>

        {/* Global Progress Bar */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-primary/20 w-full">
           <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </header>

      {/* Main Container - Three Panes Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Tab Switcher */}
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

        <main className={cn(
          "flex-1 flex overflow-hidden lg:mr-[280px]",
          "pt-[48px] md:pt-0" // Space for mobile tabs
        )}>
          
          {/* Left Pane: Content (Independent Scroll) */}
          <div className={cn(
            "w-full md:w-1/2 overflow-y-auto border-r bg-muted/5 custom-scrollbar",
            mobileTab === 'content' ? "block" : "hidden md:block"
          )}>
            <div className="max-w-4xl mx-auto p-8">
               {isVipPreview && (
                <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl text-center">
                  <p className="text-warning font-medium text-sm">
                    Đây là đề thi VIP. Bạn đang xem trước một phần nội dung.
                  </p>
                </div>
              )}

              {(() => {
                const groups: { passageGroup: any; questions: typeof sortedQuestions }[] = [];
                
                sortedQuestions.forEach((q) => {
                  const lastGroup = groups[groups.length - 1];
                  // Gộp vào nhóm trước đó nếu cùng passageGroupId (và không null)
                  if (lastGroup && q.passageGroupId && lastGroup.passageGroup?.id === q.passageGroupId) {
                    lastGroup.questions.push(q);
                  } else {
                    groups.push({ passageGroup: q.passageGroup || null, questions: [q] });
                  }
                });

                return groups.map((group, gIdx) => (
                  group.passageGroup && group.passageGroup.passages && group.passageGroup.passages.length > 0 && (
                    <div key={gIdx} className="mb-10 last:mb-0">
                      <div className="mb-4">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded text-xs font-bold uppercase">
                          Questions {group.questions[0].order} - {group.questions[group.questions.length - 1].order}
                        </span>
                      </div>
                      <div className="space-y-6">
                        {group.passageGroup.passages
                          .sort((a: any, b: any) => a.order - b.order)
                          .map((p: any) => (
                            <div key={p.id} className="space-y-4">
                              {p.mediaType === 'AUDIO' ? (
                                <AudioPlayer url={p.mediaUrl} className="mb-4" />
                              ) : p.mediaType === 'VIDEO' ? (
                                <div className="space-y-4 mb-4">
                                  {/* Chỉ hiện ảnh cho Part 1, các Part nghe khác chỉ hiện Audio cho đỡ phức tạp */}
                                  {exam.part === 'PART1' && (
                                    <div className="rounded-xl overflow-hidden border bg-white p-2 shadow-sm">
                                      <img 
                                        src={p.mediaUrl?.replace(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i, '.jpg')} 
                                        alt="Passage illustration" 
                                        className="w-full h-auto object-contain mx-auto" 
                                      />
                                    </div>
                                  )}
                                  <AudioPlayer url={p.mediaUrl} />
                                </div>
                              ) : p.mediaType === 'IMAGE' ? (
                                <div className="rounded-xl overflow-hidden border bg-white p-2 shadow-sm">
                                  <img src={p.mediaUrl} alt="Passage illustration" className="w-full h-auto object-contain mx-auto" />
                                </div>
                              ) : (
                                /* Fallback for old data without mediaType or unknown type */
                                p.mediaUrl ? (
                                  p.mediaUrl.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i) ? (
                                    <div className="space-y-4 mb-4">
                                      {exam.part?.toUpperCase() === 'PART1' && (
                                        <div className="rounded-xl overflow-hidden border bg-white p-2 shadow-sm">
                                          <img 
                                            src={p.mediaUrl.replace(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i, '.jpg')} 
                                            alt="Passage illustration" 
                                            className="w-full h-auto object-contain mx-auto" 
                                          />
                                        </div>
                                      )}
                                      <AudioPlayer url={p.mediaUrl} />
                                    </div>
                                  ) : p.mediaUrl.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                                    <AudioPlayer url={p.mediaUrl} className="mb-4" />
                                  ) : (
                                    <div className="rounded-xl overflow-hidden border bg-white p-2 shadow-sm">
                                      <img src={p.mediaUrl} alt="Passage illustration" className="w-full h-auto object-contain mx-auto" />
                                    </div>
                                  )
                                ) : (
                                  <div 
                                    className="text-base md:text-lg leading-relaxed passage-content font-serif text-foreground/90 bg-card p-6 rounded-xl border shadow-sm"
                                    dangerouslySetInnerHTML={{ __html: p.content || '' }}
                                  />
                                )
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                ));
              })()}

              {!exam.questions.some(q => q.passageGroup) && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 py-20">
                  <BookOpen className="w-16 h-16 mb-4" />
                  <p>Phần này không có đoạn văn đi kèm</p>
                </div>
              )}
            </div>
          </div>

          {/* Right/Center Pane: Questions (Independent Scroll) */}
          <div className={cn(
            "flex-1 overflow-y-auto bg-background custom-scrollbar",
            mobileTab === 'questions' ? "block" : "hidden md:block"
          )}>
            <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-8">
              {/* Question list */}
              {sortedQuestions.map((q) => {
                const selectedOptionId = session?.answers[q.id] || null;
                const isBookmarked = session?.bookmarks.includes(q.id);

                return (
                  <div
                    key={q.id}
                    id={`question-${q.id}`}
                    className="bg-card rounded-xl border p-6 shadow-sm scroll-mt-6 transition-all hover:border-primary/30"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 text-sm">
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
                        onClick={() => toggleBookmark(exam.id, q.id)}
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
                              onChange={() => selectAnswer(exam.id, q.id, opt.id)}
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

              {/* Bottom Navigation */}
              <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                 <Button variant="outline" className="w-full sm:w-auto gap-2 rounded-full px-6">
                    <ChevronLeft className="w-4 h-4" /> Câu trước
                 </Button>
                 <Button className="w-full sm:w-auto gap-2 rounded-full px-8 bg-primary hover:bg-primary/90">
                    Câu tiếp theo <ChevronRight className="w-4 h-4" />
                 </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Palette (Fixed on Desktop) */}
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
                />
              </div>

              <div className="mt-6 pt-6 border-t">
                 <Button 
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/10"
                    onClick={() => submitExam('manual')}
                    disabled={isPending}
                  >
                    Nộp bài thi
                  </Button>
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
                  />
               </div>
               <div className="p-6 border-t bg-muted/20">
                  <Button 
                    className="w-full h-12 font-bold"
                    onClick={() => {
                      setIsSheetOpen(false);
                      submitExam('manual');
                    }}
                  >
                    Nộp bài
                  </Button>
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};
