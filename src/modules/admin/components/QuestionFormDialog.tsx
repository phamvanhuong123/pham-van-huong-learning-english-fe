import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QuestionPreview } from './QuestionPreview';
import type { QuestionCreateBody, QuestionDifficulty, OptionLabel } from '@/types/admin';

interface QuestionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: QuestionCreateBody) => Promise<void>;
  initialData?: any;
  exams: { id: string; title: string }[];
  isPending: boolean;
}

export function QuestionFormDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  exams,
  isPending,
}: QuestionFormDialogProps) {
  const [examId, setExamId] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [passage, setPassage] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<{ label: OptionLabel; text: string; isCorrect: boolean }[]>([
    { label: 'A', text: '', isCorrect: false },
    { label: 'B', text: '', isCorrect: false },
    { label: 'C', text: '', isCorrect: false },
    { label: 'D', text: '', isCorrect: false },
  ]);
  const [grammarTopic, setGrammarTopic] = useState('');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('EASY');
  const [explanation, setExplanation] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setExamId(initialData.examId || '');
        setOrder(initialData.order || 1);
        setPassage(initialData.passage || '');
        setQuestionText(initialData.questionText || '');
        setOptions(initialData.options?.length === 4 ? initialData.options : [
          { label: 'A', text: '', isCorrect: false },
          { label: 'B', text: '', isCorrect: false },
          { label: 'C', text: '', isCorrect: false },
          { label: 'D', text: '', isCorrect: false },
        ]);
        setGrammarTopic(initialData.grammarTopic || '');
        setDifficulty(initialData.difficulty || 'EASY');
        setExplanation(initialData.explanation || '');
      } else {
        setExamId('');
        setOrder(1);
        setPassage('');
        setQuestionText('');
        setOptions([
          { label: 'A', text: '', isCorrect: false },
          { label: 'B', text: '', isCorrect: false },
          { label: 'C', text: '', isCorrect: false },
          { label: 'D', text: '', isCorrect: false },
        ]);
        setGrammarTopic('');
        setDifficulty('EASY');
        setExplanation('');
      }
      setErrors({});
      setShowPreview(false);
    }
  }, [isOpen, initialData]);

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === index,
    }));
    setOptions(newOptions);
    if (errors.options) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs.options;
        return newErrs;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!examId) newErrors.examId = 'Vui lòng chọn đề thi';
    if (!questionText.trim()) newErrors.questionText = 'Câu hỏi không được để trống';
    if (!grammarTopic.trim()) newErrors.grammarTopic = 'Chủ đề ngữ pháp không được để trống';
    if (explanation.trim().length < 20) newErrors.explanation = 'Giải thích phải từ 20 ký tự trở lên';
    
    if (options.some(o => !o.text.trim())) {
      newErrors.optionTexts = 'Nội dung các đáp án không được để trống';
    }
    
    const hasCorrect = options.some(o => o.isCorrect);
    if (!hasCorrect) {
      newErrors.options = 'Vui lòng chọn 1 đáp án đúng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (status: 'DRAFT' | 'PUBLISHED') => {
    if (!validate()) return;
    onSave({
      examId,
      order,
      passage: passage.trim() || undefined,
      questionText,
      options,
      explanation,
      grammarTopic,
      difficulty,
      status,
    });
  };

  const previewData: QuestionCreateBody = {
    examId, order, passage, questionText, options, explanation, grammarTopic, difficulty, status: 'DRAFT'
  };

  // const difficultyLabels: Record<QuestionDifficulty, { label: string; color: string }> = {
  //   EASY: { label: 'Dễ', color: 'text-green-600' },
  //   MEDIUM: { label: 'Trung bình', color: 'text-yellow-600' },
  //   HARD: { label: 'Khó', color: 'text-red-600' },
  // };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <DialogTitle className="text-xl font-bold">
            {initialData ? '✏️ Chỉnh sửa câu hỏi' : '✨ Tạo câu hỏi mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {showPreview ? (
            <div className="p-6 space-y-4 bg-gradient-to-br from-background to-muted/20">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPreview(false)}
                className="hover:bg-primary/10"
              >
                ← Quay lại chỉnh sửa
              </Button>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <QuestionPreview question={previewData} />
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6 bg-gradient-to-br from-background to-muted/20">
              {/* Card thông tin cơ bản */}
              <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
                <h3 className="font-semibold text-base flex items-center gap-2 text-primary">
                  <span className="w-1 h-5 bg-primary rounded-full"></span>
                  Thông tin cơ bản
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium">
                      Đề thi <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={examId} 
                      onValueChange={(val) => { 
                        setExamId(val); 
                        setErrors(prev => {
                          const newErrs = { ...prev };
                          delete newErrs.examId;
                          return newErrs;
                        });
                      }}
                    >
                      <SelectTrigger className={`transition-all ${errors.examId ? 'border-red-500 ring-2 ring-red-200' : 'hover:border-primary/50'}`}>
                        <SelectValue placeholder="Chọn đề thi" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map(ex => (
                          <SelectItem key={ex.id} value={ex.id}>{ex.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.examId && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.examId}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Thứ tự câu</Label>
                    <Input
                      type="number"
                      min={1}
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                      className="hover:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Đoạn văn <span className="text-xs text-muted-foreground font-normal">(Tùy chọn - dành cho Part 6, Part 7)</span>
                  </Label>
                  <textarea
                    className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 min-h-[120px] resize-y hover:border-primary/50 transition-colors"
                    placeholder="Nhập đoạn văn (nếu có)..."
                    value={passage}
                    onChange={(e) => setPassage(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Câu hỏi <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    className={`flex w-full rounded-lg border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 min-h-[100px] resize-y transition-all ${
                      errors.questionText 
                        ? 'border-red-500 ring-2 ring-red-200' 
                        : 'border-input hover:border-primary/50 focus-visible:ring-primary'
                    }`}
                    placeholder="Nhập nội dung câu hỏi..."
                    value={questionText}
                    onChange={(e) => { 
                      setQuestionText(e.target.value); 
                      setErrors(prev => {
                        const newErrs = { ...prev };
                        delete newErrs.questionText;
                        return newErrs;
                      });
                    }}
                  />
                  {errors.questionText && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.questionText}
                    </p>
                  )}
                </div>
              </div>

              {/* Card đáp án */}
              <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base flex items-center gap-2 text-primary">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Đáp án <span className="text-red-500">*</span>
                  </h3>
                  {errors.options && (
                    <span className="text-xs font-medium text-red-500 bg-red-50 px-3 py-1 rounded-full">
                      {errors.options}
                    </span>
                  )}
                </div>
                
                <div className={`space-y-3 p-5 rounded-xl border-2 transition-all ${
                  errors.options 
                    ? 'border-red-300 bg-red-50/50' 
                    : 'border-dashed border-muted-foreground/20 bg-muted/30'
                }`}>
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-start gap-3 group">
                      <label className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-all mt-1 flex-shrink-0 ${
                        opt.isCorrect 
                          ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-600 shadow-lg shadow-green-200' 
                          : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5'
                      }`}>
                        <input
                          type="radio"
                          name="correct-option"
                          className="sr-only"
                          checked={opt.isCorrect}
                          onChange={() => handleCorrectChange(idx)}
                        />
                        <span className={`text-sm font-bold ${
                          opt.isCorrect ? 'text-white' : 'text-foreground group-hover:text-primary'
                        }`}>
                          {opt.label}
                        </span>
                      </label>
                      <div className="flex-1 space-y-1">
                        <Input
                          placeholder={`Nhập đáp án ${opt.label}...`}
                          value={opt.text}
                          onChange={(e) => { 
                            handleOptionChange(idx, e.target.value); 
                            setErrors(prev => {
                              const newErrs = { ...prev };
                              delete newErrs.optionTexts;
                              return newErrs;
                            });
                          }}
                          className={`transition-all ${
                            errors.optionTexts && !opt.text.trim() 
                              ? 'border-red-500 ring-2 ring-red-200' 
                              : 'hover:border-primary/50'
                          } ${opt.isCorrect ? 'bg-green-50/50 border-green-300' : ''}`}
                        />
                        {opt.isCorrect && (
                          <p className="text-xs text-green-600 font-medium ml-1">✓ Đáp án đúng</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {errors.optionTexts && (
                    <p className="text-xs text-red-500 flex items-center gap-1 pt-2">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.optionTexts}
                    </p>
                  )}
                </div>
              </div>

              {/* Card metadata */}
              <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
                <h3 className="font-semibold text-base flex items-center gap-2 text-primary">
                  <span className="w-1 h-5 bg-primary rounded-full"></span>
                  Thông tin bổ sung
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Chủ đề ngữ pháp <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="VD: Tenses, Nouns, Articles..."
                      value={grammarTopic}
                      onChange={(e) => { 
                        setGrammarTopic(e.target.value); 
                        setErrors(prev => {
                          const newErrs = { ...prev };
                          delete newErrs.grammarTopic;
                          return newErrs;
                        });
                      }}
                      className={`transition-all ${
                        errors.grammarTopic 
                          ? 'border-red-500 ring-2 ring-red-200' 
                          : 'hover:border-primary/50'
                      }`}
                    />
                    {errors.grammarTopic && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.grammarTopic}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Độ khó</Label>
                    <Select 
                      value={difficulty} 
                      onValueChange={(val: QuestionDifficulty) => setDifficulty(val)}
                    >
                      <SelectTrigger className="hover:border-primary/50 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Dễ
                          </span>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            Trung bình
                          </span>
                        </SelectItem>
                        <SelectItem value="HARD">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            Khó
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Giải thích <span className="text-red-500">*</span>
                    <span className="text-xs text-muted-foreground font-normal ml-2">
                      ({explanation.length}/20 ký tự tối thiểu)
                    </span>
                  </Label>
                  <textarea
                    className={`flex w-full rounded-lg border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 min-h-[120px] resize-y transition-all ${
                      errors.explanation 
                        ? 'border-red-500 ring-2 ring-red-200' 
                        : 'border-input hover:border-primary/50 focus-visible:ring-primary'
                    }`}
                    placeholder="Giải thích chi tiết tại sao đáp án này đúng, phân tích cấu trúc ngữ pháp, từ vựng..."
                    value={explanation}
                    onChange={(e) => { 
                      setExplanation(e.target.value); 
                      setErrors(prev => {
                        const newErrs = { ...prev };
                        delete newErrs.explanation;
                        return newErrs;
                      });
                    }}
                  />
                  {errors.explanation && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gradient-to-r from-muted/30 to-muted/50 flex-row justify-between items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
            className="hover:bg-primary/10 transition-colors"
          >
            {showPreview ? '📝 Đóng Preview' : '👁️ Xem Preview'}
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleSave('DRAFT')} 
              disabled={isPending}
              className="hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700 transition-colors"
            >
              💾 Lưu Draft
            </Button>
            <Button 
              onClick={() => handleSave('PUBLISHED')} 
              disabled={isPending}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
            >
              {isPending ? '⏳ Đang lưu...' : '✅ Publish'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
