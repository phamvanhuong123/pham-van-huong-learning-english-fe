import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SM2Status } from '../types';

interface SM2BadgeProps {
  status: SM2Status;
  className?: string;
}

const SM2_CONFIG: Record<SM2Status, { label: string; className: string }> = {
  NEW: {
    label: 'New',
    className: 'bg-muted text-muted-foreground border-border',
  },
  LEARNING: {
    label: 'Learning',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  REVIEW: {
    label: 'Review',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  MASTERED: {
    label: 'Mastered',
    className: 'bg-success/10 text-success border-success/20',
  },
};

export function SM2Badge({ status, className }: SM2BadgeProps) {
  const config = SM2_CONFIG[status] ?? SM2_CONFIG.NEW;

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium uppercase tracking-wide px-2.5 py-0.5 border',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
