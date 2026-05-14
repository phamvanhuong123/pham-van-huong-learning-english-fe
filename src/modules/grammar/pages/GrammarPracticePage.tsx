import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchGrammarPractice } from '@/services/grammarClientApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Info, 
  RotateCcw, 
  Home,
  Loader2,
  Trophy,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function GrammarPracticePage() {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const { data: questions, isLoading, refetch } = useQuery<any[]>({
    queryKey: ['grammar', 'practice', topicSlug],
    queryFn: () => fetchGrammarPractice(topicSlug!),
    enabled: !!topicSlug,
  });

  const currentQuestion = questions?.[currentIndex];

  const handleSelect = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      toast.warning('Vui lòng chọn một đáp án');
      return;
    }
    setIsSubmitted(true);
    const correctOption = currentQuestion.options.find((o: any) => o.isCorrect);
    if (selectedOption === correctOption?.id) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < (questions?.length || 0) - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Đang chuẩn bị câu hỏi...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="p-6 bg-muted rounded-full">
          <Info className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Chưa có câu hỏi cho chủ đề này</h2>
          <p className="text-muted-foreground">Vui lòng quay lại sau hoặc chọn chủ đề khác.</p>
        </div>
        <Button onClick={() => navigate('/grammar')}>Quay lại danh sách</Button>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
        <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-primary/5 to-indigo-500/5">
          <CardContent className="p-10 text-center space-y-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border-4 border-primary/20">
                <Trophy className="w-16 h-16 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-lg animate-bounce">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tight">Hoàn thành!</h2>
              <p className="text-muted-foreground text-lg">Bạn đã hoàn thành bài luyện tập ngữ pháp.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-2xl shadow-sm border space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Đúng</p>
                <p className="text-3xl font-black text-green-600">{score}/{questions.length}</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tỷ lệ</p>
                <p className="text-3xl font-black text-primary">{percentage}%</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={restart} variant="outline" className="flex-1 h-12 rounded-xl text-base gap-2">
                <RotateCcw className="w-4 h-4" /> Thử lại
              </Button>
              <Button onClick={() => navigate('/grammar')} className="flex-1 h-12 rounded-xl text-base gap-2 shadow-lg shadow-primary/20">
                <Home className="w-4 h-4" /> Về trang chủ đề
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/grammar')} className="text-muted-foreground hover:text-primary gap-1">
          <ChevronLeft className="w-4 h-4" /> Thoát luyện tập
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">Câu {currentIndex + 1}/{questions.length}</span>
        </div>
      </div>

      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-700 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* Question Card */}
      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardContent className="p-8 md:p-10 space-y-8">
          {/* Question Text */}
          <div className="space-y-4">
            <Badge variant="secondary" className="px-3 py-1 rounded-lg bg-primary/10 text-primary border-none font-bold">
              Câu {currentIndex + 1}
            </Badge>
            <h3 className="text-xl md:text-2xl font-bold leading-relaxed text-foreground">
              {currentQuestion.questionText}
            </h3>
          </div>

          {/* Options List */}
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((opt: any) => {
              const isSelected = selectedOption === opt.id;
              const isCorrect = opt.isCorrect;
              const showResult = isSubmitted;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  disabled={isSubmitted}
                  className={cn(
                    "flex items-center p-5 rounded-2xl border-2 transition-all duration-200 text-left group relative",
                    !showResult && isSelected && "border-primary bg-primary/5 shadow-md",
                    !showResult && !isSelected && "border-transparent bg-muted/40 hover:bg-muted hover:border-muted-foreground/20",
                    showResult && isCorrect && "border-green-500 bg-green-50 shadow-md",
                    showResult && isSelected && !isCorrect && "border-red-500 bg-red-50 shadow-md",
                    showResult && !isSelected && !isCorrect && "opacity-60 border-transparent bg-muted/40"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mr-4 shrink-0 transition-colors",
                    !showResult && isSelected && "bg-primary border-primary text-white",
                    !showResult && !isSelected && "border-muted-foreground/30 text-muted-foreground group-hover:border-primary/50 group-hover:text-primary",
                    showResult && isCorrect && "bg-green-500 border-green-500 text-white",
                    showResult && isSelected && !isCorrect && "bg-red-500 border-red-500 text-white"
                  )}>
                    {opt.label}
                  </div>
                  <span className={cn(
                    "text-base md:text-lg font-medium",
                    !showResult && isSelected && "text-primary",
                    showResult && isCorrect && "text-green-700",
                    showResult && isSelected && !isCorrect && "text-red-700"
                  )}>
                    {opt.text}
                  </span>

                  {showResult && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Section */}
          {isSubmitted && (
            <div className="animate-in slide-in-from-top-4 fade-in duration-500 space-y-4">
              <div className={cn(
                "p-6 rounded-2xl border flex gap-4",
                selectedOption === currentQuestion.options.find((o: any) => o.isCorrect)?.id
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              )}>
                <div className="p-2 h-fit rounded-full bg-white shadow-sm shrink-0">
                  {selectedOption === currentQuestion.options.find((o: any) => o.isCorrect).id ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">
                    {selectedOption === currentQuestion.options.find((o: any) => o.isCorrect)?.id 
                      ? 'Chính xác! Làm tốt lắm.' 
                      : 'Rất tiếc, chưa đúng rồi.'}
                  </h4>
                  <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQuestion.explanation }} />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4">
            {!isSubmitted ? (
              <Button 
                onClick={handleSubmit} 
                disabled={!selectedOption}
                className="h-12 px-10 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              >
                Gửi đáp án
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                className="h-12 px-10 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform gap-2"
              >
                {currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
