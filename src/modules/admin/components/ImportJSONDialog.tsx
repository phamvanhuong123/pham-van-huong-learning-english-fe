import { useState, useRef } from 'react';
import { z } from 'zod';
import { Upload, X, CheckCircle, AlertCircle, FileCode, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { QuestionCreateBody } from '@/types/admin';
import { adminApi } from '@/services/adminApi';
import { Label } from '@/components/ui/label';

// Map tên trường sang tiếng Việt
const fieldLabels: Record<string, string> = {
  examId: 'Mã đề thi',
  order: 'Thứ tự câu',
  passage: 'Đoạn văn',
  questionText: 'Nội dung câu hỏi',
  options: 'Danh sách đáp án',
  explanation: 'Giải thích',
  grammarTopic: 'Chủ đề ngữ pháp',
  difficulty: 'Độ khó',
  status: 'Trạng thái',
  'options.label': 'Nhãn đáp án',
  'options.text': 'Nội dung đáp án',
  'options.isCorrect': 'Đáp án đúng',
};

const formatZodError = (issue: z.ZodIssue) => {
  const path = issue.path.join('.');
  const lastPart = issue.path[issue.path.length - 1];
  const label = fieldLabels[path] || (lastPart !== undefined ? fieldLabels[lastPart.toString()] : null) || path;
  
  if (issue.code === 'invalid_type') {
    return `${label}: Kiểu dữ liệu không hợp lệ (Mong đợi ${(issue as any).expected}, nhận ${(issue as any).received})`;
  }
  if (issue.code === 'too_small') {
    return `${label}: Độ dài quá ngắn (Tối thiểu ${(issue as any).minimum} ký tự)`;
  }
  return `${label}: ${issue.message}`;
};

// Schema cho 1 câu hỏi lẻ
const questionSchema = z.object({
  examId: z.string(),
  order: z.number(),
  questionText: z.string().optional().nullable(),
  options: z
    .array(
      z.object({
        label: z.enum(['A', 'B', 'C', 'D']),
        text: z.string().min(1, 'Nội dung đáp án không được để trống'),
        isCorrect: z.boolean(),
      })
    )
    .length(4, 'Phải có chính xác 4 đáp án')
    .refine(
      (opts) => opts.filter((o) => o.isCorrect).length === 1,
      'Phải có đúng 1 đáp án đúng'
    ),
  explanation: z.string().min(20, 'Giải thích phải có ít nhất 20 ký tự'),
  grammarTopic: z.string().min(1, 'Chủ đề ngữ pháp không được để trống'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

// Schema cho nhóm bài đọc (Part 6/7)
const passageGroupSchema = z.object({
  examId: z.string(),
  order: z.number(),
  passages: z.array(z.object({
    content: z.string().optional().nullable(),
    order: z.number(),
    mediaUrl: z.string().optional(),
  })).min(1),
  questions: z.array(questionSchema).min(1),
});

const importSchema = z.union([questionSchema, passageGroupSchema]);

interface ImportJSONDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (validQuestions: QuestionCreateBody[]) => Promise<void>;
  isPending: boolean;
}

export function ImportJSONDialog({
  isOpen,
  onClose,
  onImport,
  isPending,
}: ImportJSONDialogProps) {
  const [validItems, setValidItems] = useState<QuestionCreateBody[]>([]);
  const [errors, setErrors] = useState<{ index: number; messages: string[] }[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [importMode, setImportMode] = useState<'FILE' | 'TEXT'>('FILE');
  const [showExample, setShowExample] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setValidItems([]);
    setErrors([]);
    setFileName(null);
    setJsonText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processJson = (json: any) => {
    try {
      const dataArr = Array.isArray(json) ? json : [json];
      let valid: QuestionCreateBody[] = [];
      let errs: { index: number; messages: string[] }[] = [];

      dataArr.forEach((item, index) => {
        const result = importSchema.safeParse(item);
        if (result.success) {
          valid.push(result.data as any);
        } else {
          errs.push({
            index,
            messages: result.error.issues.map(formatZodError),
          });
        }
      });

      setValidItems(valid);
      setErrors(errs);
    } catch (err) {
      toast.error('Dữ liệu không đúng định dạng JSON');
      setValidItems([]);
      setErrors([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        processJson(json);
      } catch (err) {
        toast.error('File không đúng định dạng JSON');
        handleReset();
      }
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setJsonText(text);
    if (!text.trim()) {
      setValidItems([]);
      setErrors([]);
      return;
    }
    try {
      const json = JSON.parse(text);
      processJson(json);
    } catch (err) {
      // Đợi user nhập xong mới báo lỗi hoặc không báo lỗi liên tục
      setValidItems([]);
      setErrors([{ index: 0, messages: ['Chuỗi JSON chưa hợp lệ (đang nhập dở hoặc sai cú pháp)'] }]);
    }
  };

  const handleConfirm = async () => {
    if (validItems.length === 0) return;
    
    // Phân loại để gọi API tương ứng
    const questions: QuestionCreateBody[] = [];
    const passageGroups: any[] = [];
    
    validItems.forEach((item: any) => {
      if (item.passages) passageGroups.push(item);
      else questions.push(item);
    });

    if (questions.length > 0) await onImport(questions);
    
    for (const group of passageGroups) {
      try {
        await adminApi.createPassageGroup(group);
      } catch (e: any) {
        toast.error(`Lỗi khi tạo nhóm bài đọc: ${e.message}`);
      }
    }

    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleReset();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Câu Hỏi (JSON)</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2 custom-scrollbar">
          {/* Hướng dẫn cấu trúc */}
          <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileCode className="w-4 h-4 text-primary" />
                Cấu trúc file JSON mẫu
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-[11px] font-medium"
                onClick={() => setShowExample(!showExample)}
              >
                {showExample ? 'Thu gọn' : 'Xem chi tiết'}
              </Button>
            </div>
            
            {showExample && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="relative group">
                  <pre className="bg-zinc-950 text-zinc-300 p-4 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[300px] custom-scrollbar">
{`[
  {
    "examId": "ID-DE-THI",
    "order": 1,
    "questionText": "Nội dung câu hỏi...",
    "passage": "Đoạn văn (nếu có)",
    "options": [
      { "label": "A", "text": "Đáp án 1", "isCorrect": true },
      { "label": "B", "text": "Đáp án 2", "isCorrect": false },
      { "label": "C", "text": "Đáp án 3", "isCorrect": false },
      { "label": "D", "text": "Đáp án 4", "isCorrect": false }
    ],
    "explanation": "Giải thích chi tiết (min 20 ký tự)...",
    "grammarTopic": "Chủ đề ngữ pháp",
    "difficulty": "EASY",
    "status": "PUBLISHED"
  }
]`}
                  </pre>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 bg-white/10 hover:bg-white/20 border-white/10"
                    onClick={() => {
                      navigator.clipboard.writeText(`[
  {
    "examId": "ID-DE-THI",
    "order": 1,
    "questionText": "What is the primary goal of the company?",
    "passage": "Company XYZ was founded in 1990...",
    "options": [
      { "label": "A", "text": "To increase profit", "isCorrect": true },
      { "label": "B", "text": "To reduce staff", "isCorrect": false },
      { "label": "C", "text": "To close down", "isCorrect": false },
      { "label": "D", "text": "To change name", "isCorrect": false }
    ],
    "explanation": "According to the passage, the primary goal mentioned is increasing profit.",
    "grammarTopic": "Reading Comprehension",
    "difficulty": "EASY",
    "status": "PUBLISHED"
  }
]`);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                      toast.success('Đã copy mẫu JSON vào clipboard');
                    }}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                  * Lưu ý: <code className="text-primary font-bold">examId</code> phải tồn tại trong hệ thống. <code className="text-primary font-bold">difficulty</code> nhận: EASY, MEDIUM, HARD.
                </p>
              </div>
            )}
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-muted rounded-lg w-full">
            <button
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                importMode === 'FILE' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => { setImportMode('FILE'); handleReset(); }}
            >
              Tải file (.json)
            </button>
            <button
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                importMode === 'TEXT' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => { setImportMode('TEXT'); handleReset(); }}
            >
              Nhập trực tiếp
            </button>
          </div>

          {/* UPLOAD MODE */}
          {importMode === 'FILE' && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors text-center ${
                fileName ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
              }`}
              onClick={() => !fileName && fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".json"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {fileName ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">{fileName}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-8 text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    disabled={isPending}
                  >
                    Chọn file khác
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Click để tải lên file JSON</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    File phải chứa mảng các object đúng định dạng schema câu hỏi.
                  </p>
                </>
              )}
            </div>
          )}

          {/* TEXT MODE */}
          {importMode === 'TEXT' && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground ml-1">Paste chuỗi JSON của bạn vào đây:</Label>
              <textarea
                className="w-full h-48 p-4 text-[11px] font-mono rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all custom-scrollbar"
                placeholder='[ { "examId": "...", "questionText": "...", ... } ]'
                value={jsonText}
                onChange={(e) => handleTextChange(e.target.value)}
              />
            </div>
          )}

          {/* Validation Result */}
          {(fileName || jsonText) && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="font-semibold text-sm">Kết quả kiểm tra:</h3>
              
              <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 border border-success/20 text-success">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">
                  {validItems.length} câu hợp lệ và sẵn sàng import.
                </span>
              </div>

              {errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
                    <X className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">
                      {errors.length} câu lỗi sẽ bị bỏ qua:
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2 bg-muted p-3 rounded-md border border-border">
                    {errors.map((err) => (
                      <div key={err.index} className="text-sm">
                        <span className="font-semibold text-destructive">Item index {err.index}:</span>
                        <ul className="list-disc pl-5 mt-1 text-muted-foreground space-y-1">
                          {err.messages.map((msg, i) => (
                            <li key={i}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {validItems.length === 0 && errors.length === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-warning/10 border border-warning/20 text-warning">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">File không chứa câu hỏi nào.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-end gap-2 pt-4 border-t border-border mt-auto">
          <Button variant="outline" onClick={() => { handleReset(); onClose(); }} disabled={isPending}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={validItems.length === 0 || isPending}
            className="min-w-[140px]"
          >
            {isPending ? 'Đang Import...' : `Import ${validItems.length} câu`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
