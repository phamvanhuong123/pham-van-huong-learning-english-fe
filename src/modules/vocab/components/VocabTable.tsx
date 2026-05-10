import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { VocabTableRow } from './VocabTableRow';
import type { Vocab } from '../types';

interface VocabTableProps {
  vocabs: Vocab[];
  selectedIds: Set<string>;
  onSelectOne: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { meaning?: string; topic?: string }) => void;
  isLoading?: boolean;
  deletingIds?: Set<string>;
}

export function VocabTable({
  vocabs,
  selectedIds,
  onSelectOne,
  onSelectAll,
  onDelete,
  onUpdate,
  isLoading = false,
  deletingIds = new Set(),
}: VocabTableProps) {
  const allSelected = vocabs.length > 0 && vocabs.every((v) => selectedIds.has(v.id));
  const someSelected = vocabs.some((v) => selectedIds.has(v.id)) && !allSelected;

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Từ/Cụm từ</TableHead>
              <TableHead>Nghĩa</TableHead>
              <TableHead>Chủ đề</TableHead>
              <TableHead>Trạng thái SM-2</TableHead>
              <TableHead>Ngày thêm</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <td className="p-4"><Skeleton className="h-4 w-4" /></td>
                <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                <td className="p-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                <td className="p-4"><Skeleton className="h-8 w-16" /></td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (vocabs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card flex flex-col items-center justify-center py-16 gap-3">
        <div className="text-4xl">📚</div>
        <p className="text-muted-foreground text-sm font-medium">
          Không tìm thấy từ nào
        </p>
        <p className="text-xs text-muted-foreground">
          Thêm từ mới hoặc thử thay đổi bộ lọc
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-10">
              <Checkbox
                checked={someSelected ? 'indeterminate' : allSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                aria-label="Chọn tất cả"
                id="vocab-select-all"
              />
            </TableHead>
            <TableHead className="font-semibold">Từ/Cụm từ</TableHead>
            <TableHead className="font-semibold">Nghĩa</TableHead>
            <TableHead className="font-semibold">Chủ đề</TableHead>
            <TableHead className="font-semibold">Trạng thái SM-2</TableHead>
            <TableHead className="font-semibold">Ngày thêm</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {vocabs.map((vocab) => (
            <VocabTableRow
              key={vocab.id}
              vocab={vocab}
              isSelected={selectedIds.has(vocab.id)}
              onSelect={onSelectOne}
              onDelete={onDelete}
              onUpdate={onUpdate}
              isDeleting={deletingIds.has(vocab.id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
