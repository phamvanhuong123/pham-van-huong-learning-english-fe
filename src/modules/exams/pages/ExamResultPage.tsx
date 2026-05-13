import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Target, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/exam/AudioPlayer';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { fetchResultById } from '@/services/examLibraryApi';
import type { ExamResultDetail } from '@/types/exams';
import { useExamStore } from '@/modules/workspace/store/useExamStore';


function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} phút ${s.toString().padStart(2, '0')} giây`;
}

const PART_LABEL: Record<string, string> = {
  PART5: 'Part 5',
  PART6: 'Part 6',
  PART7: 'Part 7',
  FULL: 'Full Test',
};

function ResultSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function ExamResultPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<ExamResultDetail>({
    queryKey: ['exam-result', resultId],
    queryFn: () => fetchResultById(resultId!),
    enabled: !!resultId,
  });

  if (isLoading) return <ResultSkeleton />;

  if (isError || !data) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8">
          <p className="font-semibold text-destructive">Không thể tải kết quả bài thi</p>
          <p className="text-sm text-muted-foreground mt-1">Kết quả không tồn tại hoặc đã bị xóa.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/history')}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Quay lại lịch sử
          </Button>
        </div>
      </div>
    );
  }

  const accuracyPct = Math.round((data.correctQ / data.totalQ) * 100);
  const isGood = accuracyPct >= 70;
  console.log(data)
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Overview Section */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate('/history')}
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Kết quả bài thi</h1>
            <p className="text-sm text-muted-foreground">{data.exam.title}</p>
          </div>
        </div>

        {/* Score Card */}
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4 shadow-sm">
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${
              isGood ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'
            }`}
          >
            <span className={`text-3xl font-bold ${isGood ? 'text-success' : 'text-destructive'}`}>
              {data.score}
            </span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {isGood ? ' Kết quả tốt!' : ' Hãy cố gắng thêm!'}
          </p>
          <div className="flex items-center justify-center gap-1">
            {isGood ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <span className={`font-medium ${isGood ? 'text-success' : 'text-destructive'}`}>
              {accuracyPct}% chính xác
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Câu đúng</p>
              <p className="font-bold text-foreground">{data.correctQ}/{data.totalQ}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2 rounded-lg bg-info/10">
              <Clock className="h-4 w-4 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Thời gian</p>
              <p className="font-bold text-foreground">{formatTime(data.timeTaken)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2 rounded-lg bg-muted">
              <span className="font-semibold text-muted-foreground text-xs px-1">P</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Part</p>
              <p className="font-bold text-foreground line-clamp-1">{PART_LABEL[data.exam.part] ?? data.exam.part}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2 rounded-lg bg-muted">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ngày làm</p>
              <p className="font-bold text-foreground line-clamp-1">
                {new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(new Date(data.submittedAt))}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 max-w-2xl mx-auto">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              useExamStore.getState().clearSession(data.exam.id);
              navigate(`/workspace/${data.exam.id}`);
            }}
          >
            Làm lại bài
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/history')}
          >
            Xem lịch sử
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate('/exams')}
          >
            Làm bài mới
          </Button>
        </div>
      </div>

      <hr className="border-border" />

      {/* Review Section */}
      {data.details && data.details.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Xem giải thích chi tiết
          </h2>
          
          <div className="space-y-12">
            {(() => {
              // Logic gộp nhóm chi tiết kết quả theo passageGroupId
              const groups: { passageGroup: any; details: typeof data.details }[] = [];
              data.details.forEach((d) => {
                const q = d.question as any;
                const lastGroup = groups[groups.length - 1];
                if (lastGroup && q.passageGroupId && lastGroup.passageGroup?.id === q.passageGroupId) {
                  lastGroup.details.push(d);
                } else {
                  groups.push({ passageGroup: q.passageGroup || null, details: [d] });
                }
              });

              return groups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-6">
                  {/* Hiển thị các đoạn văn trong nhóm nếu có */}
                  {group.passageGroup && group.passageGroup.passages && (
                    <div className="space-y-4">
                      {group.passageGroup.passages
                        .sort((a: any, b: any) => a.order - b.order)
                        .map((p: any) => (
                          <div key={p.id} className="bg-muted/30 border border-border rounded-xl p-6 shadow-sm border-l-4 border-primary/50">
                            <div className="text-sm font-bold text-primary mb-3 uppercase tracking-wider flex items-center gap-2">
                              <BookOpen className="h-4 w-4" /> Đoạn văn {group.passageGroup.passages.length > 1 ? p.order : ''}
                            </div>
                            <div 
                              className="text-base leading-relaxed font-serif text-foreground/90 passage-content"
                              dangerouslySetInnerHTML={{ __html: p.content || '' }}
                            />
                            {p.mediaType === 'AUDIO' ? (
                              <AudioPlayer url={p.mediaUrl} className="mt-4" />
                            ) : p.mediaType === 'VIDEO' ? (
                              <div className="space-y-4 mt-4">
                                {data.exam.part?.toUpperCase() === 'PART1' && (
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
                              <div className="mt-4 rounded-xl overflow-hidden border bg-white p-2 shadow-sm">
                                <img src={p.mediaUrl} alt="Passage illustration" className="w-full h-auto object-contain mx-auto" />
                              </div>
                            ) : (
                              /* Fallback for old data without mediaType or unknown type */
                              p.mediaUrl ? (
                                p.mediaUrl.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i) ? (
                                  <div className="space-y-4 mt-4">
                                    {data.exam.part?.toUpperCase() === 'PART1' && (
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
                                  <AudioPlayer url={p.mediaUrl} className="mt-4" />
                                ) : (
                                  <div className="mt-4 rounded-xl overflow-hidden border bg-white p-2 shadow-sm">
                                    <img src={p.mediaUrl} alt="Passage illustration" className="w-full h-auto object-contain mx-auto" />
                                  </div>
                                )
                              ) : (
                                <div 
                                  className="text-base leading-relaxed font-serif text-foreground/90 passage-content bg-card p-6 rounded-xl border shadow-sm"
                                  dangerouslySetInnerHTML={{ __html: p.content || '' }}
                                />
                              )
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Danh sách các câu hỏi thuộc nhóm này */}
                  <div className="space-y-6">
                    {group.details.map((detail) => {
                      const q = detail.question;
                      // Tìm vị trí thật của câu hỏi trong mảng gốc để hiển thị số thứ tự đúng
                      const originalIndex = data.details.findIndex(d => d.questionId === detail.questionId);
                      
                      return (
                        <div key={detail.questionId} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                          <div className="flex flex-col gap-4">
                            {/* Question Title */}
                            <div className="flex gap-3">
                              <span className={cn(
                                "shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white",
                                detail.isCorrect ? "bg-success" : "bg-destructive"
                              )}>
                                {originalIndex + 1}
                              </span>
                              <p className="text-lg font-medium pt-1 text-foreground">{q.questionText}</p>
                            </div>

                            <div className="flex-1 space-y-4 ml-11">
                      
                      {/* Options */}
                      <div className="grid grid-cols-1 gap-3">
                        {q.options.map((opt) => {
                          const isSelected = detail.selectedOptionId === opt.id;
                          const isCorrectOpt = detail.correctOptionId === opt.id;
                          
                          let bgClass = "bg-transparent hover:bg-muted/50";
                          let labelClass = "bg-muted text-muted-foreground border-border";
                          
                          if (isSelected && isCorrectOpt) {
                            bgClass = "bg-success/10 border-success text-success shadow-sm";
                            labelClass = "bg-success text-white border-success";
                          } else if (isSelected && !isCorrectOpt) {
                            bgClass = "bg-destructive/10 border-destructive text-destructive shadow-sm";
                            labelClass = "bg-destructive text-white border-destructive";
                          } else if (!isSelected && isCorrectOpt) {
                            bgClass = "bg-success/5 border-success/50 text-success shadow-sm ring-1 ring-success/30";
                            labelClass = "bg-success text-white border-success";
                          }

                          return (
                            <div
                              key={opt.id}
                              className={cn(
                                "flex items-center justify-start h-auto py-3 px-4 text-left font-normal border rounded-md transition-all",
                                bgClass
                              )}
                            >
                              <span className={cn(
                                "font-bold mr-3 shrink-0 w-7 h-7 rounded-full flex items-center justify-center border",
                                labelClass
                              )}>
                                {opt.label}
                              </span>
                              <span className="flex-1">{opt.text}</span>
                              
                              {/* Icon indicator */}
                              {isSelected && isCorrectOpt && <CheckCircle2 className="h-5 w-5 text-success ml-2 flex-shrink-0" />}
                              {isSelected && !isCorrectOpt && <XCircle className="h-5 w-5 text-destructive ml-2 flex-shrink-0" />}
                              {!isSelected && isCorrectOpt && <CheckCircle2 className="h-5 w-5 text-success/50 ml-2 flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {(detail.explanation || detail.grammarTopic) && (
                        <div className="mt-6 p-5 bg-info/5 border border-info/20 rounded-lg space-y-3">
                          <h4 className="font-semibold text-info flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Giải thích
                          </h4>
                          {detail.grammarTopic && (
                            <div className="inline-block px-2.5 py-1 bg-info/10 text-info text-xs font-medium rounded-full mb-2">
                              Chủ điểm: {detail.grammarTopic}
                            </div>
                          )}
                          {detail.explanation && (
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {detail.explanation}
                            </p>
                          )}
                        </div>
                      )}
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
        </div>
      )}
    </div>
  );
}
