import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Upload, AlertCircle, CheckCircle2, Download, Info, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CSVVocabRow } from '@/types/vocab';

interface ImportCSVDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (vocabs: CSVVocabRow[]) => void;
  isLoading?: boolean;
}

type ParseError = { message: string };

export function ImportCSVDialog({ open, onClose, onImport, isLoading = false }: ImportCSVDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<CSVVocabRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setParsedRows([]);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields ?? [];

        // Validate required columns
        if (!headers.includes('word') || !headers.includes('meaning')) {
          setParseError(
            'File CSV phải có ít nhất 2 cột "word" và "meaning". Vui lòng kiểm tra lại file.'
          );
          return;
        }

        // Validate rows
        const validRows: CSVVocabRow[] = [];
        const invalidRows: number[] = [];

        results.data.forEach((row, idx) => {
          if (!row.word?.trim() || !row.meaning?.trim()) {
            invalidRows.push(idx + 2); // +2 = 1 for header, 1 for 0-index
          } else {
            validRows.push({
              word: row.word.trim(),
              meaning: row.meaning.trim(),
              example: row.example?.trim() || undefined,
              topic: row.topic?.trim() || undefined,
            });
          }
        });

        if (invalidRows.length > 0) {
          setParseError(
            `${invalidRows.length} dòng bị bỏ qua vì thiếu word hoặc meaning (dòng ${invalidRows.slice(0, 5).join(', ')}${invalidRows.length > 5 ? '...' : ''})`
          );
        }

        if (validRows.length === 0) {
          setParseError('Không tìm thấy dữ liệu hợp lệ. Vui lòng tải file mẫu và thử lại.');
          return;
        }

        setParsedRows(validRows);
      },
      error: (err: ParseError) => {
        setParseError(`Lỗi đọc file: ${err.message}`);
      },
    });

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'word,meaning,example,topic\napple,quả táo,I eat an apple every day,Fruit\npersistent,kiên trì,He was persistent in his efforts,Personality';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'vocab_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setParsedRows([]);
    setParseError(null);
    setFileName(null);
    onClose();
  };

  const handleConfirm = () => {
    if (parsedRows.length > 0) {
      onImport(parsedRows);
    }
  };

  const previewRows = parsedRows.slice(0, 5);
  const remaining = parsedRows.length - previewRows.length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import từ file Excel/CSV
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <div className="bg-muted/50 p-3 rounded-lg border border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-2 mb-2 font-medium text-foreground uppercase tracking-wider">
                <Info className="h-3 w-3" /> Hướng dẫn cấu trúc file
              </div>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="text-primary font-mono">word</code>: Từ vựng hoặc cụm từ (Bắt buộc)</li>
                <li><code className="text-primary font-mono">meaning</code>: Nghĩa của từ (Bắt buộc)</li>
                <li><code className="text-primary font-mono">example</code>: Ví dụ minh họa (Tùy chọn)</li>
                <li><code className="text-primary font-mono">topic</code>: Chủ đề (Tùy chọn)</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button 
              variant="link" 
              size="sm" 
              onClick={handleDownloadTemplate}
              className="text-primary h-auto p-0"
            >
              <Download className="h-3 w-3 mr-1" />
              Tải file mẫu (.csv)
            </Button>
          </div>

          {/* Upload area */}
          <div
            className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Chọn file CSV"
          >
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {fileName ? (
                <span className="text-primary">{fileName}</span>
              ) : (
                'Kéo thả hoặc nhấn để tải lên file CSV'
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Hỗ trợ định dạng .csv (UTF-8)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
              id="csv-file-input"
              aria-label="CSV file input"
            />
          </div>

          {/* Error state */}
          {parseError && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/5 border border-destructive/20 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preview table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Sẵn sàng nhập {parsedRows.length} từ — Xem trước nội dung:
                </span>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[30%]">Từ vựng</TableHead>
                      <TableHead className="w-[45%]">Nghĩa</TableHead>
                      <TableHead>Chủ đề</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-transparent">
                        <TableCell className="font-semibold text-primary">{row.word}</TableCell>
                        <TableCell className="text-muted-foreground text-sm line-clamp-2">{row.meaning}</TableCell>
                        <TableCell className="text-muted-foreground text-sm italic">{row.topic || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {remaining > 0 && (
                <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">
                  + {remaining} từ khác trong danh sách
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Đóng
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={parsedRows.length === 0 || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              `Nhập ${parsedRows.length} từ vựng`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
