import { Skeleton } from '@/components/ui/skeleton';

export const WorkspaceSkeleton = () => {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Left Column: Question Area */}
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          
          <div className="mt-8 flex flex-col gap-3">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>

        {/* Right Column: Sidebar (Palette & Timer) */}
        <div className="hidden lg:flex flex-col gap-6 sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <Skeleton className="h-8 w-1/2 mb-6" />
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
