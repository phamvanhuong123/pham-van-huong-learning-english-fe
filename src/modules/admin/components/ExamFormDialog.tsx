
import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
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
import type { AdminExamItem, ExamCreateBody, ExamPart, ExamType, QuestionDifficulty } from '@/types/admin';
import { Loader2, Save, Sparkles, Pencil, Info, Settings2, Clock, Layers, Trophy, LinkIcon, CheckCircle2 } from 'lucide-react';

interface ExamFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExamCreateBody) => Promise<void>;
  initialData?: AdminExamItem | null;
  isPending: boolean;
  /** Danh sách tất cả đề thi để chọn làm đề con cho FULL */
  allExams?: AdminExamItem[];
}

const PART_ORDER: Record<string, number> = { 
  PART1: 1, PART2: 2, PART3: 3, PART4: 4, 
  PART5: 5, PART6: 6, PART7: 7 
};

export function ExamFormDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  isPending,
  allExams = [],
}: ExamFormDialogProps) {
  const [title, setTitle] = useState('');
  const [part, setPart] = useState<ExamPart>('PART5');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('EASY');
  const [type, setType] = useState<ExamType>('FREE');
  const [duration, setDuration] = useState(15);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State cho FULL — map part → examId đã chọn
  const [selectedComponents, setSelectedComponents] = useState<Record<string, string>>({
    PART1: '',
    PART2: '',
    PART3: '',
    PART4: '',
    PART5: '',
    PART6: '',
    PART7: '',
  });

  // Danh sách đề lẻ (không phải FULL, không phải đề con của đề khác)
  const availableExams = allExams.filter((e) => e.part !== 'FULL' && !e.parentExamId);

  const examsByPart: Record<string, AdminExamItem[]> = {
    PART1: availableExams.filter((e) => e.part === 'PART1'),
    PART2: availableExams.filter((e) => e.part === 'PART2'),
    PART3: availableExams.filter((e) => e.part === 'PART3'),
    PART4: availableExams.filter((e) => e.part === 'PART4'),
    PART5: availableExams.filter((e) => e.part === 'PART5'),
    PART6: availableExams.filter((e) => e.part === 'PART6'),
    PART7: availableExams.filter((e) => e.part === 'PART7'),
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setPart(initialData.part || 'PART5');
        setDifficulty(initialData.difficulty || 'EASY');
        setType(initialData.type || 'FREE');
        setDuration(initialData.duration || 15);
        // Khôi phục childExams nếu đang edit đề FULL
        if (initialData.part === 'FULL' && initialData.childExams) {
          const comp: Record<string, string> = { 
            PART1: '', PART2: '', PART3: '', PART4: '',
            PART5: '', PART6: '', PART7: '' 
          };
          initialData.childExams.forEach((c) => { comp[c.part] = c.id; });
          setSelectedComponents(comp);
        }
      } else {
        setTitle('');
        setPart('PART5');
        setDifficulty('EASY');
        setType('FREE');
        setDuration(15);
        setSelectedComponents({ 
          PART1: '', PART2: '', PART3: '', PART4: '',
          PART5: '', PART6: '', PART7: '' 
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Tiêu đề không được để trống';
    if (duration <= 0) newErrors.duration = 'Thời gian phải lớn hơn 0';
    if (part === 'FULL') {
      const chosen = Object.values(selectedComponents).filter((val) => val && val !== 'none');
      if (chosen.length === 0) {
        newErrors.components = 'Vui lòng chọn ít nhất 1 đề thành phần';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const componentExamIds =
      part === 'FULL'
        ? Object.values(selectedComponents).filter((val) => val && val !== 'none')
        : undefined;
    onSave({ title: title.trim(), part, difficulty, type, duration, componentExamIds });
  };

  const partLabels: Record<string, { label: string; color: string; desc: string }> = {
    PART1: { label: 'Part 1', color: 'bg-orange-100 text-orange-700 border-orange-200', desc: 'Photos (6 tranh ảnh)' },
    PART2: { label: 'Part 2', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', desc: 'Question-Response (25 câu hỏi)' },
    PART3: { label: 'Part 3', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', desc: 'Short Conversations (13 đoạn, 3 câu/đoạn)' },
    PART4: { label: 'Part 4', color: 'bg-cyan-100 text-cyan-700 border-cyan-200', desc: 'Short Talks (10 đoạn, 3 câu/đoạn)' },
    PART5: { label: 'Part 5', color: 'bg-blue-100 text-blue-700 border-blue-200', desc: 'Grammar (30 câu điền từ)' },
    PART6: { label: 'Part 6', color: 'bg-purple-100 text-purple-700 border-purple-200', desc: 'Passage Completion (4 đoạn, 4 câu/đoạn)' },
    PART7: { label: 'Part 7', color: 'bg-green-100 text-green-700 border-green-200', desc: 'Reading Comprehension (nhiều đoạn văn)' },
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[540px] flex flex-col p-0 gap-0 border-l shadow-2xl">
        <SheetHeader className="px-6 py-5 border-b bg-muted/30 flex-shrink-0">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            {initialData ? (
              <><Pencil className="w-5 h-5 text-primary" /> Chỉnh sửa đề thi</>
            ) : (
              <><Sparkles className="w-5 h-5 text-primary" /> Tạo đề thi mới</>
            )}
          </SheetTitle>
          <SheetDescription>
            Điền đầy đủ thông tin bên dưới để {initialData ? 'cập nhật' : 'tạo mới'} đề thi vào hệ thống.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gradient-to-br from-background to-muted/20">
          {/* Section: Thông tin chính */}
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
            <h3 className="font-semibold text-base flex items-center gap-2 text-primary">
              <Info className="w-5 h-5" /> Thông tin cơ bản
            </h3>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Tiêu đề đề thi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="VD: TOEIC Practice Test — May 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`h-11 transition-all ${errors.title ? 'border-red-500 ring-2 ring-red-200' : 'hover:border-primary/50'}`}
              />
              {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground" /> Phần thi
                </Label>
                <Select value={part} onValueChange={(val: ExamPart) => setPart(val)}>
                  <SelectTrigger className="h-10 hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PART1">Part 1 (Photos)</SelectItem>
                    <SelectItem value="PART2">Part 2 (Question-Response)</SelectItem>
                    <SelectItem value="PART3">Part 3 (Short Conversations)</SelectItem>
                    <SelectItem value="PART4">Part 4 (Short Talks)</SelectItem>
                    <SelectItem value="PART5">Part 5 (Grammar)</SelectItem>
                    <SelectItem value="PART6">Part 6 (Passage)</SelectItem>
                    <SelectItem value="PART7">Part 7 (Reading)</SelectItem>
                    <SelectItem value="FULL">Full Simulation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" /> Phân quyền
                </Label>
                <Select value={type} onValueChange={(val: ExamType) => setType(val)}>
                  <SelectTrigger className="h-10 hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE" className="text-emerald-600">Miễn phí (FREE)</SelectItem>
                    <SelectItem value="VIP" className="text-amber-600">Dành cho VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ── Chọn đề con (chỉ khi FULL) ── */}
          {part === 'FULL' && (
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
              <h3 className="font-semibold text-base flex items-center gap-2 text-primary">
                <LinkIcon className="w-5 h-5" /> Ghép đề thành phần
              </h3>
              <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-100 px-4 py-3 rounded-lg leading-relaxed">
                Chọn các đề lẻ đã tạo để ghép thành đề FULL. Khi học viên thi, hệ thống sẽ tự động gộp câu hỏi theo thứ tự Part 5 → Part 6 → Part 7.
              </p>

              {errors.components && (
                <p className="text-xs text-red-500 font-medium">{errors.components}</p>
              )}

              {[...(['PART1', 'PART2', 'PART3', 'PART4', 'PART5', 'PART6', 'PART7'] as const)].sort((a, b) => PART_ORDER[a] - PART_ORDER[b]).map((p) => (
                <div key={p} className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${partLabels[p].color}`}>
                      {partLabels[p].label}
                    </span>
                    <span className="text-muted-foreground font-normal">{partLabels[p].desc}</span>
                  </Label>
                  <Select
                    value={selectedComponents[p]}
                    onValueChange={(val) => {
                      setSelectedComponents((prev) => ({ ...prev, [p]: val }));
                      setErrors((prev) => { const n = { ...prev }; delete n.components; return n; });
                    }}
                  >
                    <SelectTrigger className={`hover:border-primary/50 transition-colors ${selectedComponents[p] && selectedComponents[p] !== 'none' ? 'border-green-400 bg-green-50/30' : ''}`}>
                      <SelectValue placeholder={`Chọn đề ${partLabels[p].label}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Không chọn —</SelectItem>
                      {examsByPart[p].map((ex) => (
                        <SelectItem key={ex.id} value={ex.id}>
                          <span className="flex items-center gap-2">
                            {ex.isPublished && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                            {ex.title}
                            <span className="text-xs text-muted-foreground">({ex.questionCount} câu)</span>
                          </span>
                        </SelectItem>
                      ))}
                      {examsByPart[p].length === 0 && (
                        <div className="text-xs text-muted-foreground px-4 py-3 text-center">
                          Chưa có đề {partLabels[p].label} nào. Hãy tạo trước.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              {/* Tổng kết câu hỏi */}
              {Object.values(selectedComponents).some((val) => val && val !== 'none') && (
                <div className="bg-muted/40 rounded-lg p-4 text-sm space-y-1">
                  <p className="font-medium text-muted-foreground mb-2"> Tổng kết đề FULL:</p>
                  {(['PART1', 'PART2', 'PART3', 'PART4', 'PART5', 'PART6', 'PART7'] as const).map((p) => {
                    const exam = allExams.find((e) => e.id === selectedComponents[p]);
                    if (!exam) return null;
                    return (
                      <div key={p} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{partLabels[p].label}: {exam.title}</span>
                        <span className="font-medium">{exam.questionCount} câu</span>
                      </div>
                    );
                  })}
                  <div className="border-t pt-2 flex justify-between font-semibold text-xs">
                    <span>Tổng cộng</span>
                    <span>
                      {Object.values(selectedComponents).reduce((sum, id) => {
                        const exam = allExams.find((e) => e.id === id);
                        return sum + (exam?.questionCount ?? 0);
                      }, 0)} câu
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section: Cấu hình */}
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
            <h3 className="font-semibold text-base flex items-center gap-2 text-primary">
              <Settings2 className="w-5 h-5" /> Cấu hình & Độ khó
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Độ khó mục tiêu</Label>
                <Select value={difficulty} onValueChange={(val: QuestionDifficulty) => setDifficulty(val)}>
                  <SelectTrigger className="h-10 hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Dễ (Dành cho 0-450)</SelectItem>
                    <SelectItem value="MEDIUM">Trung bình (450-750)</SelectItem>
                    <SelectItem value="HARD">Khó (Trên 750+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" /> Thời gian (phút)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="h-10 hover:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {part !== 'FULL' && (
              <div className="bg-blue-50/50 p-4 rounded-lg flex items-start gap-3 border border-blue-100">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-blue-700 leading-relaxed italic mt-0.5">
                  Mẹo: Sau khi tạo đề thi, bạn có thể chuyển sang trang <b>Ngân hàng câu hỏi</b> để import hàng loạt câu hỏi bằng file JSON hoặc thêm thủ công.
                </p>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="px-6 py-5 border-t bg-muted/10 flex-shrink-0">
          <Button variant="ghost" onClick={onClose} disabled={isPending} className="hover:bg-muted">
            Hủy bỏ
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="min-w-[140px] bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> {initialData ? 'Cập nhật đề thi' : 'Tạo đề thi ngay'}</>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
