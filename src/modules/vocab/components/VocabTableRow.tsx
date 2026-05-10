import { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { SM2Badge } from './SM2Badge';
import type { Vocab } from '../types';

interface VocabTableRowProps {
  vocab: Vocab;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { meaning?: string; topic?: string }) => void;
  isDeleting?: boolean;
}

export function VocabTableRow({
  vocab,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  isDeleting = false,
}: VocabTableRowProps) {
  const [editMode, setEditMode] = useState(false);
  const [draftMeaning, setDraftMeaning] = useState(vocab.meaning);
  const [draftTopic, setDraftTopic] = useState(vocab.topic ?? '');

  // Sync draft with props when not editing
  useEffect(() => {
    if (!editMode) {
      setDraftMeaning(vocab.meaning);
      setDraftTopic(vocab.topic ?? '');
    }
  }, [vocab.meaning, vocab.topic, editMode]);

  const handleSave = () => {
    const payload: { meaning?: string; topic?: string } = {};
    if (draftMeaning.trim() !== vocab.meaning) payload.meaning = draftMeaning.trim();
    if (draftTopic.trim() !== (vocab.topic ?? '')) payload.topic = draftTopic.trim();

    if (Object.keys(payload).length > 0) {
      onUpdate(vocab.id, payload);
    }
    setEditMode(false);
  };

  const handleCancel = () => {
    setDraftMeaning(vocab.meaning);
    setDraftTopic(vocab.topic ?? '');
    setEditMode(false);
  };

  const formattedDate = new Date(vocab.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <TableRow
      className="group transition-colors hover:bg-muted/40"
      data-selected={isSelected}
    >
      {/* Checkbox */}
      <TableCell className="w-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(vocab.id, !!checked)}
          aria-label={`Chọn từ ${vocab.word}`}
          id={`vocab-check-${vocab.id}`}
        />
      </TableCell>

      {/* Word */}
      <TableCell className="font-semibold text-foreground min-w-[140px]">
        {vocab.word}
      </TableCell>

      {/* Meaning — editable */}
      <TableCell className="min-w-[200px]">
        {editMode ? (
          <Input
            value={draftMeaning}
            onChange={(e) => setDraftMeaning(e.target.value)}
            className="h-8 text-sm"
            aria-label="Chỉnh sửa nghĩa"
            id={`vocab-meaning-${vocab.id}`}
          />
        ) : (
          <span className="text-sm text-muted-foreground line-clamp-2">
            {vocab.meaning}
          </span>
        )}
      </TableCell>

      {/* Topic — editable */}
      <TableCell className="min-w-[120px]">
        {editMode ? (
          <Input
            value={draftTopic}
            onChange={(e) => setDraftTopic(e.target.value)}
            className="h-8 text-sm"
            placeholder="Chủ đề..."
            aria-label="Chỉnh sửa chủ đề"
            id={`vocab-topic-${vocab.id}`}
          />
        ) : (
          <span className="text-sm text-muted-foreground">
            {vocab.topic ?? '—'}
          </span>
        )}
      </TableCell>

      {/* SM-2 Status */}
      <TableCell>
        <SM2Badge status={vocab.schedule?.status ?? 'NEW'} />
      </TableCell>

      {/* Date */}
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {formattedDate}
      </TableCell>

      {/* Actions */}
      <TableCell className="w-[100px]">
        <div className="flex items-center gap-1">
          {editMode ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-success hover:text-success"
                onClick={handleSave}
                aria-label="Lưu chỉnh sửa"
                id={`vocab-save-${vocab.id}`}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleCancel}
                aria-label="Hủy chỉnh sửa"
                id={`vocab-cancel-${vocab.id}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setEditMode(true)}
                aria-label={`Chỉnh sửa ${vocab.word}`}
                id={`vocab-edit-${vocab.id}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={() => onDelete(vocab.id)}
                disabled={isDeleting}
                aria-label={`Xóa ${vocab.word}`}
                id={`vocab-delete-${vocab.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
