import type { FilterPart, FilterDifficulty, FilterType } from '../types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamFilterBarProps {
  part: FilterPart;
  difficulty: FilterDifficulty;
  type: FilterType;
  onPartChange: (v: FilterPart) => void;
  onDifficultyChange: (v: FilterDifficulty) => void;
  onTypeChange: (v: FilterType) => void;
  onReset: () => void;
}

const PART_OPTIONS: { label: string; value: FilterPart }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Part 5', value: 'PART5' },
  { label: 'Part 6', value: 'PART6' },
  { label: 'Part 7', value: 'PART7' },
];

const DIFFICULTY_OPTIONS: { label: string; value: FilterDifficulty }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Dễ', value: 'EASY' },
  { label: 'Trung bình', value: 'MEDIUM' },
  { label: 'Khó', value: 'HARD' },
];

const TYPE_OPTIONS: { label: string; value: FilterType }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Miễn phí', value: 'FREE' },
  { label: 'VIP', value: 'VIP' },
];

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            id={`filter-${label}-${opt.value}`}
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 border',
              value === opt.value
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const hasActiveFilter = (part: FilterPart, difficulty: FilterDifficulty, type: FilterType) =>
  part !== 'ALL' || difficulty !== 'ALL' || type !== 'ALL';

export function ExamFilterBar({ part, difficulty, type, onPartChange, onDifficultyChange, onTypeChange, onReset }: ExamFilterBarProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Bộ lọc</span>
        {hasActiveFilter(part, difficulty, type) && (
          <Button
            id="filter-reset-btn"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
            onClick={onReset}
          >
            <X className="w-3 h-3" /> Xóa bộ lọc
          </Button>
        )}
      </div>
      <FilterGroup label="Part" options={PART_OPTIONS} value={part} onChange={onPartChange} />
      <FilterGroup label="Độ khó" options={DIFFICULTY_OPTIONS} value={difficulty} onChange={onDifficultyChange} />
      <FilterGroup label="Loại" options={TYPE_OPTIONS} value={type} onChange={onTypeChange} />
    </div>
  );
}
