import { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
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
import {
  Pencil, Sparkles, ArrowLeft, EyeOff, Eye, Save, Loader2,
  CheckCircle2, Info, ListChecks, Settings2, Check, PlusCircle,
  AlertCircle, FileText,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';

interface ExamOption {
  id: string;
  title: string;
  part?: string;
}

interface QuestionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Trả về data + flag isContinue để container quyết định đóng form hay không */
  onSave: (data: QuestionCreateBody, isContinue?: boolean) => Promise<void>;
  initialData?: any;
  exams: ExamOption[];
  isPending: boolean;
}

const BLANK_OPTIONS = (): { label: OptionLabel; text: string; isCorrect: boolean }[] => [
  { label: 'A', text: '', isCorrect: false },
  { label: 'B', text: '', isCorrect: false },
  { label: 'C', text: '', isCorrect: false },
  { label: 'D', text: '', isCorrect: false },
];

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
  const [passageGroupId, setPassageGroupId] = useState('');
  const [passageGroups, setPassageGroups] = useState<any[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(BLANK_OPTIONS());
  const [grammarTopic, setGrammarTopic] = useState('');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('EASY');
  const [explanation, setExplanation] = useState('');
  
  // New state for creating/editing passage group
  const [isCreatingPassage, setIsCreatingPassage] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [newPassages, setNewPassages] = useState<any[]>([{ content: '', order: 1 }]);
  const [isCreatingGroupPending, setIsCreatingGroupPending] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // ─── Tính toán Part của đề đang được chọn ────────────────────────────────
  const selectedExamPart = useMemo(() => {
    if (!examId) return null;
    const found = exams.find((e) => e.id === examId);
    return found?.part ?? null;
  }, [examId, exams]);

  // Part 6 hoặc 7 mới cần passage
  const requiresPassage = selectedExamPart === 'PART6' || selectedExamPart === 'PART7';

  // ─── Khởi tạo form ────────────────────────────────────────────────────────
  // Tải danh sách Passage Groups khi examId thay đổi
  useEffect(() => {
    if (examId && (selectedExamPart === 'PART6' || selectedExamPart === 'PART7')) {
      setIsLoadingGroups(true);
      adminApi.getPassageGroups(examId)
        .then(setPassageGroups)
        .catch(() => setPassageGroups([]))
        .finally(() => setIsLoadingGroups(false));
    } else {
      setPassageGroups([]);
    }
  }, [examId, selectedExamPart]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setExamId(initialData.examId || '');
        setOrder(initialData.order || 1);
        setPassageGroupId(initialData.passageGroupId || '');
        setQuestionText(initialData.questionText || '');
        setOptions(
          initialData.options?.length === 4 ? initialData.options : BLANK_OPTIONS(),
        );
        setGrammarTopic(initialData.grammarTopic || '');
        setDifficulty(initialData.difficulty || 'EASY');
        setExplanation(initialData.explanation || '');
      } else {
        setExamId('');
        setOrder(1);
        setPassageGroupId('');
        setQuestionText('');
        setOptions(BLANK_OPTIONS());
        setGrammarTopic('');
        setDifficulty('EASY');
        setExplanation('');
      }
      setErrors({});
      setShowPreview(false);
    }
  }, [isOpen, initialData]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = options.map((opt, idx) => ({ ...opt, isCorrect: idx === index }));
    setOptions(newOptions);
    if (errors.options) {
      setErrors((prev) => { const n = { ...prev }; delete n.options; return n; });
    }
  };

  const clearError = (key: string) =>
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  const handleSavePassageGroup = async () => {
    if (!examId) {
      setErrors({ examId: 'Vui lòng chọn đề thi trước' });
      return;
    }
    
    const validPassages = newPassages.filter(p => p.content.trim());
    if (validPassages.length === 0) {
      alert('Vui lòng nhập nội dung cho ít nhất một đoạn văn');
      return;
    }

    setIsCreatingGroupPending(true);
    try {
      let group;
      if (isEditingGroup && passageGroupId) {
        group = await adminApi.updatePassageGroup(passageGroupId, { passages: validPassages });
      } else {
        group = await adminApi.createPassageGroup({
          examId,
          order: passageGroups.length + 1,
          passages: validPassages
        });
      }
      
      // Refresh list
      const updatedGroups = await adminApi.getPassageGroups(examId);
      setPassageGroups(updatedGroups);
      setPassageGroupId(group.id);
      setIsCreatingPassage(false);
      setIsEditingGroup(false);
      setNewPassages([{ content: '', order: 1 }]);
    } catch (error) {
      console.error('Failed to save passage group', error);
      alert('Có lỗi xảy ra');
    } finally {
      setIsCreatingGroupPending(false);
    }
  };

  const startEditingGroup = () => {
    const group = passageGroups.find(g => g.id === passageGroupId);
    if (group) {
      setNewPassages(group.passages.map((p: any) => ({ content: p.content, order: p.order })));
      setIsEditingGroup(true);
      setIsCreatingPassage(true);
    }
  };

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!examId) newErrors.examId = 'Vui lòng chọn đề thi';

    // Bắt buộc passage nếu là PART6/PART7
    if (requiresPassage && !passageGroupId) {
      newErrors.passageGroupId = 'Vui lòng chọn cụm bài đọc';
    }

    if (!questionText.trim()) newErrors.questionText = 'Câu hỏi không được để trống';
    if (!grammarTopic.trim()) newErrors.grammarTopic = 'Chủ đề ngữ pháp không được để trống';
    if (explanation.trim().length < 20)
      newErrors.explanation = 'Giải thích phải từ 20 ký tự trở lên';
    if (options.some((o) => !o.text.trim()))
      newErrors.optionTexts = 'Nội dung các đáp án không được để trống';
    if (!options.some((o) => o.isCorrect))
      newErrors.options = 'Vui lòng chọn 1 đáp án đúng';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Save handlers ─────────────────────────────────────────────────────────
  const handleSave = async (status: 'DRAFT' | 'PUBLISHED', isContinue = false) => {
    if (!validate()) return;
    await onSave(
      {
        examId,
        order,
        passageGroupId: requiresPassage ? (passageGroupId || undefined) : undefined,
        questionText,
        options,
        explanation,
        grammarTopic,
        difficulty,
        status,
      },
      isContinue,
    );

    // Nếu "Lưu & Tiếp tục": giữ passageGroupId + examId, reset phần còn lại, tăng order
    if (isContinue) {
      setQuestionText('');
      setOptions(BLANK_OPTIONS());
      setGrammarTopic('');
      setExplanation('');
      setOrder((prev) => prev + 1);
      setErrors({});
      setShowPreview(false);
    }
  };

  const previewData: any = {
    examId,
    order,
    passageGroupId,
    passageGroup: passageGroups.find(g => g.id === passageGroupId),
    questionText,
    options,
    explanation,
    grammarTopic,
    difficulty,
    status: 'DRAFT',
  };

  // ─── Part badge helper ─────────────────────────────────────────────────────
  const partBadge: Record<string, { label: string; color: string }> = {
    PART5: { label: 'Part 5 — Grammar', color: 'bg-blue-100 text-blue-700' },
    PART6: { label: 'Part 6 — Passage', color: 'bg-purple-100 text-purple-700' },
    PART7: { label: 'Part 7 — Reading', color: 'bg-green-100 text-green-700' },
    FULL: { label: 'Full Test', color: 'bg-orange-100 text-orange-700' },
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[800px] w-full flex flex-col p-0 gap-0 overflow-hidden border-l shadow-2xl">
        <SheetHeader className="px-6 py-5 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              {initialData ? (
                <><Pencil className="w-5 h-5 text-primary" /> Chỉnh sửa câu hỏi</>
              ) : (
                <><Sparkles className="w-5 h-5 text-primary" /> Tạo câu hỏi mới</>
              )}
            </SheetTitle>
            {selectedExamPart && partBadge[selectedExamPart] && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${partBadge[selectedExamPart].color}`}>
                {partBadge[selectedExamPart].label}
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {showPreview ? (
            <div className="p-6 space-y-4 bg-gradient-to-br from-background to-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại chỉnh sửa
              </Button>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <QuestionPreview question={previewData} />
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6 bg-gradient-to-br from-background to-muted/20">

              {/* ── Card thông tin cơ bản ── */}
              <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
                <h3 className="font-semibold text-base flex items-center gap-2 text-primary">
                  <Info className="w-5 h-5" /> Thông tin cơ bản
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 lg:col-span-9 space-y-2">
                    <Label className="text-sm font-medium">
                      Đề thi <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={examId}
                      onValueChange={(val) => { setExamId(val); clearError('examId'); }}
                    >
                      <SelectTrigger
                        className={`w-full transition-all ${errors.examId ? 'border-red-500 ring-2 ring-red-200' : 'hover:border-primary/50'}`}
                      >
                        <SelectValue placeholder="Chọn đề thi" className="truncate" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((ex) => (
                          <SelectItem key={ex.id} value={ex.id}>
                            <span className="flex items-center gap-2">
                              {ex.part && partBadge[ex.part] && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${partBadge[ex.part].color}`}>
                                  {ex.part}
                                </span>
                              )}
                              {ex.title}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.examId && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.examId}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-4 lg:col-span-3 space-y-2">
                    <Label className="text-sm font-medium text-nowrap">Thứ tự câu</Label>
                    <Input
                      type="number"
                      min={1}
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                      className="w-full hover:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                {/* ── Nhóm bài đọc — chỉ hiện khi PART6/PART7 ── */}
                {/* ── Nhóm bài đọc — chỉ hiện khi PART6/PART7 ── */}
                {requiresPassage ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-500" />
                        Cụm bài đọc / Passage Group <span className="text-red-500">*</span>
                      </Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          if (isCreatingPassage) {
                            setIsCreatingPassage(false);
                            setIsEditingGroup(false);
                            setNewPassages([{ content: '', order: 1 }]);
                          } else {
                            setIsCreatingPassage(true);
                            setIsEditingGroup(false);
                          }
                        }}
                        className="text-xs h-8 text-primary hover:text-primary hover:bg-primary/5"
                      >
                        {isCreatingPassage ? (
                          <><ArrowLeft className="w-3 h-3 mr-1" /> Quay lại chọn</>
                        ) : (
                          <><PlusCircle className="w-3 h-3 mr-1" /> Tạo cụm mới</>
                        )}
                      </Button>
                    </div>
                    
                    {isCreatingPassage ? (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                          {isEditingGroup ? 'Chỉnh sửa cụm bài đọc' : 'Thiết lập cụm bài đọc mới'}
                        </div>
                        
                        {newPassages.map((p, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Đoạn văn {idx + 1}</span>
                              {newPassages.length > 1 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setNewPassages(prev => prev.filter((_, i) => i !== idx))}
                                  className="h-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  Xóa
                                </Button>
                              )}
                            </div>
                            <textarea
                              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[100px] resize-y"
                              placeholder={`Nhập nội dung đoạn văn ${idx + 1}...`}
                              value={p.content}
                              onChange={(e) => {
                                const updated = [...newPassages];
                                updated[idx].content = e.target.value;
                                setNewPassages(updated);
                              }}
                            />
                          </div>
                        ))}
                        
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setNewPassages(prev => [...prev, { content: '', order: prev.length + 1 }])}
                            className="flex-1 h-9 border-dashed border-primary/50 text-primary hover:bg-primary/5"
                          >
                            <PlusCircle className="w-3 h-3 mr-2" /> Thêm đoạn văn
                          </Button>
                          <Button 
                            type="button" 
                            size="sm" 
                            onClick={handleSavePassageGroup}
                            disabled={isCreatingGroupPending}
                            className="flex-1 h-9 bg-primary shadow-sm"
                          >
                            {isCreatingGroupPending ? (
                              <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Đang lưu...</>
                            ) : (
                              'Lưu thay đổi'
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Select
                              value={passageGroupId}
                              onValueChange={(val) => { setPassageGroupId(val); clearError('passageGroupId'); }}
                              disabled={isLoadingGroups}
                            >
                              <SelectTrigger
                                className={`w-full transition-all ${errors.passageGroupId ? 'border-red-500 ring-2 ring-red-200' : 'hover:border-primary/50'}`}
                              >
                                <SelectValue placeholder={isLoadingGroups ? "Đang tải bài đọc..." : "Chọn cụm bài đọc"} />
                              </SelectTrigger>
                              <SelectContent>
                                {passageGroups.length === 0 ? (
                                  <div className="p-4 text-center space-y-2">
                                    <p className="text-xs text-muted-foreground italic">Đề thi này chưa có cụm bài đọc nào.</p>
                                    <p className="text-[10px] text-primary">Nhấn "Tạo cụm mới" để bắt đầu.</p>
                                  </div>
                                ) : (
                                  passageGroups.map((group, idx) => (
                                    <SelectItem key={group.id} value={group.id}>
                                      <div className="flex flex-col py-1">
                                        <span className="font-semibold text-xs">Cụm {group.order} — {group.passages.length} đoạn văn</span>
                                        <span className="text-[10px] text-muted-foreground line-clamp-1 italic">
                                          {group.passages[0]?.content?.substring(0, 80)}...
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          {passageGroupId && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={startEditingGroup}
                              className="h-10 border-primary/20 text-primary hover:bg-primary/5"
                            >
                              <Pencil className="w-3 h-3 mr-2" /> Sửa bài đọc
                            </Button>
                          )}
                        </div>

                        {errors.passageGroupId && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.passageGroupId}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : selectedExamPart === 'PART5' ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50/60 border border-blue-100 px-4 py-3 rounded-lg">
                    <Info className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Part 5 — Grammar: Không cần đoạn văn. Mỗi câu hỏi đứng độc lập.</span>
                  </div>
                ) : !examId ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border border-dashed px-4 py-3 rounded-lg">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Chọn đề thi để biết câu hỏi này có cần đoạn văn hay không.</span>
                  </div>
                ) : null}

                {/* ── Câu hỏi ── */}
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
                    onChange={(e) => { setQuestionText(e.target.value); clearError('questionText'); }}
                  />
                  {errors.questionText && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.questionText}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Card đáp án ── */}
              <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base flex items-center gap-2 text-primary">
                    <ListChecks className="w-5 h-5" />
                    Đáp án <span className="text-red-500">*</span>
                  </h3>
                  {errors.options && (
                    <span className="text-xs font-medium text-red-500 bg-red-50 px-3 py-1 rounded-full">
                      {errors.options}
                    </span>
                  )}
                </div>

                <div className={`space-y-3 p-3 sm:p-5 rounded-xl border-2 transition-all ${
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
                        <span className={`text-sm font-bold ${opt.isCorrect ? 'text-white' : 'text-foreground group-hover:text-primary'}`}>
                          {opt.label}
                        </span>
                      </label>
                      <div className="flex-1 space-y-1">
                        <Input
                          placeholder={`Nhập đáp án ${opt.label}...`}
                          value={opt.text}
                          onChange={(e) => {
                            handleOptionChange(idx, e.target.value);
                            clearError('optionTexts');
                          }}
                          className={`transition-all ${
                            errors.optionTexts && !opt.text.trim()
                              ? 'border-red-500 ring-2 ring-red-200'
                              : 'hover:border-primary/50'
                          } ${opt.isCorrect ? 'bg-green-50/50 border-green-300' : ''}`}
                        />
                        {opt.isCorrect && (
                          <p className="text-xs text-green-600 font-medium ml-1 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Đáp án đúng
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {errors.optionTexts && (
                    <p className="text-xs text-red-500 flex items-center gap-1 pt-2">
                      <AlertCircle className="w-3 h-3" /> {errors.optionTexts}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Card metadata ── */}
              <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
                <h3 className="font-semibold text-base flex items-center gap-2 text-primary">
                  <Settings2 className="w-5 h-5" /> Thông tin bổ sung
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Chủ đề ngữ pháp <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="VD: Tenses, Nouns, Articles..."
                      value={grammarTopic}
                      onChange={(e) => { setGrammarTopic(e.target.value); clearError('grammarTopic'); }}
                      className={`transition-all ${errors.grammarTopic ? 'border-red-500 ring-2 ring-red-200' : 'hover:border-primary/50'}`}
                    />
                    {errors.grammarTopic && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.grammarTopic}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Độ khó</Label>
                    <Select value={difficulty} onValueChange={(val: QuestionDifficulty) => setDifficulty(val)}>
                      <SelectTrigger className="hover:border-primary/50 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full" />Dễ</span>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full" />Trung bình</span>
                        </SelectItem>
                        <SelectItem value="HARD">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full" />Khó</span>
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
                    onChange={(e) => { setExplanation(e.target.value); clearError('explanation'); }}
                  />
                  {errors.explanation && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <SheetFooter className="px-6 py-4 border-t bg-muted/10 flex-row justify-between items-center gap-3 flex-shrink-0 flex-wrap">
          <Button
            variant="ghost"
            onClick={() => setShowPreview(!showPreview)}
            className="hover:bg-primary/10 transition-colors"
          >
            {showPreview ? (
              <><EyeOff className="w-4 h-4 mr-2" /> Đóng Preview</>
            ) : (
              <><Eye className="w-4 h-4 mr-2" /> Xem Preview</>
            )}
          </Button>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => handleSave('DRAFT')}
              disabled={isPending}
              className="hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" /> Lưu Draft
            </Button>

            {/* Nút Lưu & Tiếp tục — chỉ hiện khi Part cần passage */}
            {requiresPassage && (
              <Button
                variant="outline"
                onClick={() => handleSave('PUBLISHED', true)}
                disabled={isPending}
                className="hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition-colors border-purple-300"
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</>
                ) : (
                  <><PlusCircle className="w-4 h-4 mr-2" /> Lưu & Thêm câu tiếp</>
                )}
              </Button>
            )}

            <Button
              onClick={() => handleSave('PUBLISHED')}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Publish</>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
