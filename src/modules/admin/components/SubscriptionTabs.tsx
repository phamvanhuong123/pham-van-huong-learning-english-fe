import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionStatus } from '@/types/admin';

interface SubscriptionTabsProps {
  activeTab: SubscriptionStatus;
  onChange: (tab: SubscriptionStatus) => void;
  pendingCount?: number;
}

export function SubscriptionTabs({ activeTab, onChange, pendingCount = 0 }: SubscriptionTabsProps) {
  const tabs: { value: SubscriptionStatus; label: string; showBadge?: boolean }[] = [
    { value: 'PENDING', label: 'Chờ duyệt', showBadge: true },
    { value: 'APPROVED', label: 'Đã duyệt' },
    { value: 'REJECTED', label: 'Từ chối' },
  ];

  return (
    <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full sm:w-auto overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-w-[100px] gap-2',
            activeTab === tab.value
              ? 'bg-background text-foreground shadow-sm'
              : 'hover:bg-background/50'
          )}
          role="tab"
          aria-selected={activeTab === tab.value}
        >
          {tab.label}
          {tab.showBadge && pendingCount > 0 && (
            <Badge variant="destructive" className="h-5 px-1.5 min-w-5 rounded-full text-[10px]">
              {pendingCount > 99 ? '99+' : pendingCount}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
