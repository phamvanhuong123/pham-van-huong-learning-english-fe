import { useState, useRef } from 'react';
import { z } from 'zod';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
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

// Schema validate theo đặc tả TASK-6.4
const questionImportSchema = z.array(
  z.object({
    examId: z.string(),
    order: z.number(),
    passage: z.string().optional(),
    questionText: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
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
  })
);

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setValidItems([]);
    setErrors([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Ensure it's an array
        const dataArr = Array.isArray(json) ? json : [json];
        
        let valid: QuestionCreateBody[] = [];
        let errs: { index: number; messages: string[] }[] = [];

        dataArr.forEach((item, index) => {
          const result = questionImportSchema.element.safeParse(item);
          if (result.success) {
            valid.push(result.data as QuestionCreateBody);
          } else {
            errs.push({
              index,
              messages: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
            });
          }
        });

        setValidItems(valid);
        setErrors(errs);
      } catch (err) {
        toast.error('File không đúng định dạng JSON');
        handleReset();
      }
    };
    reader.readAsText(file);
  };

  const handleConfirm = async () => {
    if (validItems.length === 0) return;
    await onImport(validItems);
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

        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2">
          {/* Upload Area */}
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

          {/* Validation Result */}
          {fileName && (
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
