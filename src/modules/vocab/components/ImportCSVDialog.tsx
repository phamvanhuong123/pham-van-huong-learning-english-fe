import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
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
            'File CSV phải có cột "word" và "meaning". Kiểm tra lại header của file.'
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
          setParseError('Không tìm thấy dữ liệu hợp lệ. Kiểm tra lại file CSV.');
          return;
        }

        setParsedRows(validRows);
      },
      error: (err: ParseError) => {
        setParseError(`Không thể đọc file: ${err.message}`);
      },
    });

    // Reset input so same file can be re-selected
    e.target.value = '';
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
          <DialogTitle>Import từ CSV</DialogTitle>
          <DialogDescription>
            File CSV cần có cột <code className="font-mono bg-muted px-1 rounded text-xs">word</code> và{' '}
            <code className="font-mono bg-muted px-1 rounded text-xs">meaning</code> (bắt buộc).
            Cột <code className="font-mono bg-muted px-1 rounded text-xs">example</code> và{' '}
            <code className="font-mono bg-muted px-1 rounded text-xs">topic</code> là tuỳ chọn.
          </DialogDescription>
        </DialogHeader>

        {/* Upload area */}
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          aria-label="Chọn file CSV"
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {fileName ? (
              <span className="text-foreground font-medium">{fileName}</span>
            ) : (
              'Nhấn để chọn file CSV'
            )}
          </p>
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
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Preview table */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-success font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Tìm thấy {parsedRows.length} từ hợp lệ — xem trước 5 dòng đầu
              </span>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Từ/Cụm từ</TableHead>
                    <TableHead className="w-[40%]">Nghĩa</TableHead>
                    <TableHead>Chủ đề</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.word}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{row.meaning}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{row.topic || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {remaining > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                ... và {remaining} từ khác
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={parsedRows.length === 0 || isLoading}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isLoading ? 'Đang import...' : `Import ${parsedRows.length} từ`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
