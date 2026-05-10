import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Filter, Upload, Plus, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VocabTable } from './VocabTable';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ImportCSVDialog } from './ImportCSVDialog';
import {
  fetchVocabs,
  bulkDeleteVocab,
  updateVocab,
  bulkImportVocab,
} from '../api/vocabApi';
import { cn } from '@/lib/utils';
import type { SM2Status, VocabFilter, CSVVocabRow } from '../types';

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STANDARD_LIMIT = 50;
const WARN_THRESHOLD = 45;

export function VocabManagerContainer() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ─── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SM2Status | ''>('');
  const [topicFilter, setTopicFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  // ─── Selection state ───────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // ─── Dialog state ──────────────────────────────────────────────────────────
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    ids: string[];
  }>({ open: false, ids: [] });
  const [importDialog, setImportDialog] = useState(false);
  const [importResult, setImportResult] = useState<{
    skippedWords: string[];
  } | null>(null);

  // ─── Query ─────────────────────────────────────────────────────────────────
  const filter: VocabFilter = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    topic: topicFilter || undefined,
    page,
    limit: 20,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['vocabs', filter],
    queryFn: () => fetchVocabs(filter),
    placeholderData: (prev) => prev,
  });

  const vocabs = data?.vocabs ?? [];
  const total = data?.total ?? 0;
  const limitInfo = data?.limitInfo;
  const totalPages = Math.ceil(total / 20);

  // ─── Selection handlers ────────────────────────────────────────────────────
  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(vocabs.map((v) => v.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [vocabs]
  );

  // ─── Bulk delete ───────────────────────────────────────────────────────────
  const { mutate: deleteBulk, isPending: isBulkDeleting } = useMutation({
    mutationFn: (ids: string[]) => bulkDeleteVocab(ids),
    onMutate: (ids) => {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        ids.forEach(id => next.add(id));
        return next;
      });
    },
    onSuccess: (result, ids) => {
      toast.success(`Đã xóa ${result.deleted} từ thành công`);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
      setDeleteDialog({ open: false, ids: [] });
      void queryClient.invalidateQueries({ queryKey: ['vocabs'] });
    },
    onError: () => {
      toast.error('Xóa thất bại. Vui lòng thử lại.');
    },
    onSettled: (_, __, ids) => {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
    },
  });

  // ─── Update vocab ──────────────────────────────────────────────────────────
  const { mutate: doUpdate } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { meaning?: string; topic?: string } }) =>
      updateVocab(id, data),
    onSuccess: () => {
      toast.success('Đã cập nhật từ');
      void queryClient.invalidateQueries({ queryKey: ['vocabs'] });
    },
    onError: () => {
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    },
  });

  // ─── Bulk import ───────────────────────────────────────────────────────────
  const { mutate: doImport, isPending: isImporting } = useMutation({
    mutationFn: (vocabs: CSVVocabRow[]) => bulkImportVocab(vocabs),
    onSuccess: (result) => {
      toast.success(`Import thành công ${result.imported} từ`);
      setImportDialog(false);
      if (result.skippedWords.length > 0) {
        setImportResult({ skippedWords: result.skippedWords });
      }
      void queryClient.invalidateQueries({ queryKey: ['vocabs'] });
    },
    onError: () => {
      toast.error('Import thất bại. Vui lòng thử lại.');
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleDeleteSingle = useCallback((id: string) => {
    setDeleteDialog({ open: true, ids: [id] });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    setDeleteDialog({ open: true, ids: Array.from(selectedIds) });
  }, [selectedIds]);

  const handleConfirmDelete = useCallback(() => {
    deleteBulk(deleteDialog.ids);
  }, [deleteBulk, deleteDialog.ids]);

  const handleUpdate = useCallback(
    (id: string, updateData: { meaning?: string; topic?: string }) => {
      doUpdate({ id, data: updateData });
    },
    [doUpdate]
  );

  // ─── Limit info ────────────────────────────────────────────────────────────
  const isStandard = limitInfo ? limitInfo.max !== null : false;
  const usedCount = limitInfo?.used ?? 0;
  const maxCount = limitInfo?.max ?? STANDARD_LIMIT;
  const isNearLimit = isStandard && usedCount >= (limitInfo?.warnThreshold ?? WARN_THRESHOLD);
  const progressPct = isStandard ? Math.min((usedCount / maxCount) * 100, 100) : 0;

  return (
    <div className="space-y-6 p-6">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vocab Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý từ vựng và lịch ôn tập SM-2
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              id="vocab-bulk-delete-btn"
              aria-label={`Xóa ${selectedIds.size} từ đã chọn`}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Xóa đã chọn ({selectedIds.size})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/vocab/practice')}
            id="vocab-practice-btn"
            className="border-accent text-accent hover:bg-accent/5"
          >
            <BookOpen className="h-4 w-4 mr-1.5" />
            Ôn tập ngay
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportDialog(true)}
            id="vocab-import-btn"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Import CSV
          </Button>
          <Button 
            size="sm" 
            id="vocab-add-btn"
            onClick={() => toast.info('Tính năng thêm từng từ đang được cập nhật. Vui lòng dùng Import CSV.')}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Thêm từ
          </Button>
        </div>
      </div>

      {/* ── Standard User Limit Bar ── */}
      {isStandard && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              {usedCount}/{maxCount} từ đã dùng
            </span>
            {isNearLimit && (
              <span className="text-destructive text-xs font-medium">
                Sắp đạt giới hạn
              </span>
            )}
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isNearLimit ? 'bg-destructive' : 'bg-primary'
              )}
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={usedCount}
              aria-valuemin={0}
              aria-valuemax={maxCount}
            />
          </div>
        </div>
      )}

      {/* ── Filters Bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="vocab-search"
            placeholder="Tìm từ hoặc nghĩa..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
            aria-label="Tìm kiếm từ vựng"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as SM2Status | '');
            setPage(1);
          }}
        >
          <SelectTrigger id="vocab-filter-status" className="w-[160px]" aria-label="Lọc trạng thái">
            <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tất cả</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="LEARNING">Learning</SelectItem>
            <SelectItem value="REVIEW">Review</SelectItem>
            <SelectItem value="MASTERED">Mastered</SelectItem>
          </SelectContent>
        </Select>

        <Input
          id="vocab-filter-topic"
          placeholder="Chủ đề..."
          value={topicFilter}
          onChange={(e) => {
            setTopicFilter(e.target.value);
            setPage(1);
          }}
          className="w-[160px]"
          aria-label="Lọc theo chủ đề"
        />
      </div>

      {/* ── Import skipped words toast ── */}
      {importResult && importResult.skippedWords.length > 0 && (
        <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 text-sm space-y-1">
          <p className="font-medium text-warning">
            {importResult.skippedWords.length} từ bị bỏ qua (trùng lặp hoặc vượt giới hạn):
          </p>
          <p className="text-muted-foreground">
            {importResult.skippedWords.slice(0, 10).join(', ')}
            {importResult.skippedWords.length > 10 &&
              ` và ${importResult.skippedWords.length - 10} từ khác`}
          </p>
          <button
            className="text-xs text-muted-foreground underline"
            onClick={() => setImportResult(null)}
            id="vocab-dismiss-skipped"
          >
            Đóng
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <VocabTable
        vocabs={vocabs}
        selectedIds={selectedIds}
        onSelectOne={handleSelectOne}
        onSelectAll={handleSelectAll}
        onDelete={handleDeleteSingle}
        onUpdate={handleUpdate}
        isLoading={isLoading}
        deletingIds={deletingIds}
      />

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Hiển thị {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} / {total} từ
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              id="vocab-prev-page"
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              id="vocab-next-page"
            >
              Tiếp
            </Button>
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        count={deleteDialog.ids.length}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, ids: [] })}
        isLoading={isBulkDeleting}
      />

      <ImportCSVDialog
        open={importDialog}
        onClose={() => setImportDialog(false)}
        onImport={doImport}
        isLoading={isImporting}
      />
    </div>
  );
}
