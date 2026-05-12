import { cn } from '@/lib/utils';
import type { AccuracyByPartProps } from '@/types/dashboard';

interface PartBarProps {
  label: string;
  value: number | null;
}

function PartBar({ label, value }: PartBarProps) {
  const hasData = value !== null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span
          className={cn(
            'font-semibold',
            hasData ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {hasData ? `${value}%` : 'Chưa có dữ liệu'}
        </span>
      </div>
      <div
        className="h-2.5 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={value ?? 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${hasData ? `${value}%` : 'chưa có dữ liệu'}`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            hasData ? 'bg-primary' : 'bg-muted'
          )}
          style={{ width: hasData ? `${value}%` : '0%' }}
        />
      </div>
    </div>
  );
}

export function AccuracyByPartSection({ accuracyByPart }: AccuracyByPartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h2 className="text-base font-semibold text-foreground">Accuracy theo Part</h2>
      <div className="space-y-4">
        <PartBar label="Part 5 — Incomplete Sentences" value={accuracyByPart.PART5} />
        <PartBar label="Part 6 — Text Completion" value={accuracyByPart.PART6} />
        <PartBar label="Part 7 — Reading Comprehension" value={accuracyByPart.PART7} />
      </div>
    </div>
  );
}
