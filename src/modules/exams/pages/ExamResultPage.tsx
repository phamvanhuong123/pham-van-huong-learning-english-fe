import { useState } from 'react';
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
import { getPartFromOrder } from '@/modules/workspace/utils/examUtils';


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
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
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

  const [activePart, setActivePart] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT'>('ALL');

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

  // Phân tích các Part có sẵn và thống kê theo Part
  const partStats = data.details.reduce((acc, detail) => {
    const partNum = getPartFromOrder((detail.question as any).order);
    const part = `PART${partNum}`;
    if (!acc[part]) {
      acc[part] = { total: 0, correct: 0 };
    }
    acc[part].total++;
    if (detail.isCorrect) acc[part].correct++;
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  const availableParts = Object.keys(partStats).sort();
  
  // Tự động chọn Part đầu tiên nếu đang ở 'ALL' mà bài thi không phải FULL
  const effectivePart = activePart === 'ALL' && data.exam.part !== 'FULL' ? availableParts[0] : activePart;

  const getPassageLabel = (passages: any[]) => {
    if (!passages || passages.length === 0) return 'Nội dung';
    const hasAudio = passages.some(p => p.mediaType === 'AUDIO' || (p.mediaUrl && p.mediaUrl.match(/\.(mp3|wav|ogg|m4a)$/i)));
    const hasVideo = passages.some(p => p.mediaType === 'VIDEO' || (p.mediaUrl && p.mediaUrl.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i)));
    const hasImage = passages.some(p => p.mediaType === 'IMAGE');
    
    if (hasAudio || hasVideo) return 'Bài nghe';
    if (hasImage && data.exam.part === 'PART1') return 'Hình ảnh';
    return 'Đoạn văn';
  };

  const accuracyPct = Math.round((data.correctQ / data.totalQ) * 100);
  const isGood = accuracyPct >= 70;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
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
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4 shadow-sm relative overflow-hidden">
           {/* Background Decoration */}
           <div className={cn(
             "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10",
             isGood ? "bg-success" : "bg-destructive"
           )}></div>

          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 shadow-inner ${
              isGood ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'
            }`}
          >
            <span className={`text-3xl font-extrabold ${isGood ? 'text-success' : 'text-destructive'}`}>
              {data.score}
            </span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {isGood ? 'Tuyệt vời, kết quả rất tốt!' : 'Cố gắng thêm chút nữa nhé!'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5",
              isGood ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              {isGood ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {accuracyPct}% chính xác
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-sm hover:border-primary/30 transition-colors">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Câu đúng</p>
              <p className="font-bold text-foreground">{data.correctQ}/{data.totalQ}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-sm hover:border-info/30 transition-colors">
            <div className="p-2 rounded-lg bg-info/10">
              <Clock className="h-4 w-4 text-info" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Thời gian</p>
              <p className="font-bold text-foreground">{formatTime(data.timeTaken)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2 rounded-lg bg-muted">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Phần thi</p>
              <p className="font-bold text-foreground line-clamp-1">{PART_LABEL[data.exam.part] ?? data.exam.part}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2 rounded-lg bg-muted">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Ngày làm</p>
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
            className="flex-1 font-bold h-11"
            onClick={() => {
              useExamStore.getState().clearSession(data.exam.id);
              navigate(`/workspace/${data.exam.id}`);
            }}
          >
            Làm lại bài
          </Button>
          <Button
            variant="outline"
            className="flex-1 font-bold h-11"
            onClick={() => navigate('/history')}
          >
            Lịch sử
          </Button>
          <Button
            className="flex-1 font-bold h-11 shadow-lg shadow-primary/20"
            onClick={() => navigate('/exams')}
          >
            Làm bài mới
          </Button>
        </div>
      </div>

      <hr className="border-border" />

      {/* Review Section */}
      {data.details && data.details.length > 0 && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Xem giải thích chi tiết
            </h2>

            {/* Status Filter */}
            <div className="flex bg-muted p-1 rounded-lg">
              {(['ALL', 'INCORRECT', 'CORRECT'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                    statusFilter === s ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s === 'ALL' ? 'Tất cả' : s === 'CORRECT' ? 'Câu đúng' : 'Câu sai'}
                </button>
              ))}
            </div>
          </div>

          {/* Part Tabs (for Full Test or multiple parts) */}
          {availableParts.length > 1 && (
            <div className="flex flex-wrap gap-2 pb-2 border-b">
               <button
                  onClick={() => setActivePart('ALL')}
                  className={cn(
                    "px-4 py-2 text-sm font-bold border-b-2 transition-all",
                    effectivePart === 'ALL' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Tất cả các phần
                </button>
              {availableParts.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePart(p)}
                  className={cn(
                    "px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2",
                    effectivePart === p ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {PART_LABEL[p] || p}
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    partStats[p].correct === partStats[p].total ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  )}>
                    {partStats[p].correct}/{partStats[p].total}
                  </span>
                </button>
              ))}
            </div>
          )}
          
          <div className="space-y-12">
            {(() => {
              // Lọc dữ liệu trước khi gộp nhóm
              const filteredDetails = data.details.filter((d) => {
                const partNum = getPartFromOrder((d.question as any).order);
                const part = `PART${partNum}`;
                const matchesPart = effectivePart === 'ALL' || part === effectivePart;
                const matchesStatus = 
                  statusFilter === 'ALL' || 
                  (statusFilter === 'CORRECT' && d.isCorrect) || 
                  (statusFilter === 'INCORRECT' && !d.isCorrect);
                return matchesPart && matchesStatus;
              });

              if (filteredDetails.length === 0) {
                return (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Không có câu hỏi nào phù hợp với bộ lọc</p>
                    <Button variant="ghost" onClick={() => { setStatusFilter('ALL'); setActivePart('ALL'); }}>Xóa bộ lọc</Button>
                  </div>
                );
              }

              // Logic gộp nhóm chi tiết kết quả theo passageGroupId
              const groups: { passageGroup: any; details: typeof data.details }[] = [];
              filteredDetails.forEach((d) => {
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
                            <div className="text-sm font-bold text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                              <BookOpen className="h-4 w-4" /> 
                              {getPassageLabel(group.passageGroup.passages)} {group.passageGroup.passages.length > 1 ? p.order : ''}
                            </div>
                            
                            {p.mediaType === 'AUDIO' ? (
                              <div className="space-y-4">
                                {p.content && (
                                  <div 
                                    className="text-base leading-[1.8] font-sans text-foreground/90 passage-content bg-card p-8 rounded-2xl border shadow-sm break-normal [word-break:normal] [overflow-wrap:anywhere] overflow-x-auto"
                                    dangerouslySetInnerHTML={{ __html: p.content }}
                                  />
                                )}
                                <AudioPlayer url={p.mediaUrl} className="mt-4" />
                              </div>
                            ) : p.mediaType === 'VIDEO' ? (
                              <div className="space-y-4">
                                {p.content && (
                                  <div 
                                    className="text-base leading-[1.8] font-sans text-foreground/90 passage-content bg-card p-8 rounded-2xl border shadow-sm break-normal [word-break:normal] [overflow-wrap:anywhere] overflow-x-auto"
                                    dangerouslySetInnerHTML={{ __html: p.content }}
                                  />
                                )}
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
                              </div>
                            ) : p.mediaType === 'IMAGE' ? (
                              <div className="space-y-4">
                                {p.content && (
                                  <div 
                                    className="text-base leading-[1.8] font-sans text-foreground/90 passage-content bg-card p-8 rounded-2xl border shadow-sm break-normal [word-break:normal] [overflow-wrap:anywhere] overflow-x-auto"
                                    dangerouslySetInnerHTML={{ __html: p.content }}
                                  />
                                )}
                                <div className="mt-4 rounded-xl overflow-hidden border bg-white p-2 shadow-sm">
                                  <img src={p.mediaUrl} alt="Passage illustration" className="w-full h-auto object-contain mx-auto" />
                                </div>
                              </div>
                            ) : (
                              /* Default/Fallback: Render text content or media based on URL */
                              <div className="space-y-4">
                                {p.content && (
                                  <div 
                                    className="text-base leading-[1.8] font-sans text-foreground/90 passage-content bg-card p-8 rounded-2xl border shadow-sm break-words"
                                    dangerouslySetInnerHTML={{ __html: p.content }}
                                  />
                                )}
                                {p.mediaUrl && (
                                  <div className="mt-4">
                                    {p.mediaUrl.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i) ? (
                                      <div className="space-y-4">
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
                                      <AudioPlayer url={p.mediaUrl} />
                                    ) : (
                                      <div className="rounded-xl overflow-hidden border bg-white p-2 shadow-sm">
                                        <img src={p.mediaUrl} alt="Passage illustration" className="w-full h-auto object-contain mx-auto" />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
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
                        <div key={detail.questionId} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/20 transition-all">
                          <div className="flex flex-col gap-4">
                            {/* Question Title */}
                            <div className="flex gap-4">
                              <span className={cn(
                                "shrink-0 w-9 h-9 rounded-md flex items-center justify-center font-bold text-white shadow-sm",
                                detail.isCorrect ? "bg-success" : "bg-destructive"
                              )}>
                                {originalIndex + 1}
                              </span>
                              <p className="text-lg font-bold pt-1 text-foreground leading-snug">{q.questionText}</p>
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
                                "font-bold mr-3 shrink-0 w-7 h-7 rounded-md flex items-center justify-center border transition-colors",
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
                            <div 
                              className="text-sm text-foreground/80 leading-relaxed explanation-content break-normal [word-break:normal] [overflow-wrap:anywhere] w-full"
                              dangerouslySetInnerHTML={{ __html: detail.explanation }}
                            />
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
