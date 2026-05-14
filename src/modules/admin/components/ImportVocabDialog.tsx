import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileSpreadsheet, Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ImportVocabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportVocabDialog({ open, onOpenChange, onSuccess }: ImportVocabDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  const importMutation = useMutation({
    mutationFn: adminApi.bulkImportVocab,
    onSuccess: (data) => {
      setResult(data);
      toast.success(`Đã nhập thành công ${data.imported} từ vựng!`);
      if (data.skipped > 0) {
        toast.info(`Bỏ qua ${data.skipped} từ đã tồn tại.`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Nhập dữ liệu thất bại');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'text/csv' ||
        selectedFile.name.endsWith('.xlsx')
      ) {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast.error('Chỉ hỗ trợ file Excel (.xlsx) hoặc CSV');
      }
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    importMutation.mutate(file);
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onOpenChange(false);
    if (result && result.imported > 0) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Nhập từ vựng từ Excel
          </DialogTitle>
          <DialogDescription>
            Tải lên file Excel (.xlsx) để thêm hàng loạt từ vựng vào hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {!result ? (
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="excel-file">Chọn file</Label>
                <div 
                  className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer relative"
                  onClick={() => document.getElementById('excel-file')?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {file ? file.name : 'Nhấn để chọn hoặc kéo thả file vào đây'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Định dạng hỗ trợ: .xlsx, .csv (Max 10MB)
                  </p>
                  <Input 
                    id="excel-file" 
                    type="file" 
                    className="hidden" 
                    accept=".xlsx, .csv"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Cấu trúc file mẫu</AlertTitle>
                <AlertDescription className="text-xs">
                  File nên có các cột: <strong>Word, Meaning, Phonetic, Audio, Topic, Example</strong>.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg border border-green-100 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mb-2" />
                <h3 className="text-lg font-bold text-green-900">Hoàn tất nhập dữ liệu</h3>
                <div className="mt-2 grid grid-cols-2 gap-4 w-full">
                  <div className="bg-white p-3 rounded border border-green-200">
                    <div className="text-2xl font-bold text-green-700">{result.imported}</div>
                    <div className="text-[10px] uppercase text-green-600 font-bold">Thành công</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">{result.skipped}</div>
                    <div className="text-[10px] uppercase text-orange-500 font-bold">Bỏ qua (Trùng)</div>
                  </div>
                </div>
              </div>
              
              {result.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto text-[10px] font-mono p-3 bg-destructive/5 text-destructive rounded border border-destructive/10">
                  <p className="font-bold mb-1">Lỗi chi tiết:</p>
                  {result.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!result ? (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!file || importMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Bắt đầu nhập'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">Đóng</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
