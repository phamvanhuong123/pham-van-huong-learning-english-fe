import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi } from '@/services/adminApi';
import { SubscriptionTabs } from './SubscriptionTabs';
import { SubscriptionTable } from './SubscriptionTable';
import { ImageLightbox } from './ImageLightbox';
import { ApproveDialog } from './ApproveDialog';
import { RejectDialog } from './RejectDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import type { AdminSubscriptionItem, SubscriptionStatus, SubscriptionPlan } from '@/types/admin';

export function SubscriptionManagerContainer() {
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<SubscriptionStatus>('PENDING');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // States for modals
  const [lightboxUrl, setLightboxUrl] = useState('');
  const [approveSub, setApproveSub] = useState<AdminSubscriptionItem | null>(null);
  const [rejectSub, setRejectSub] = useState<AdminSubscriptionItem | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);

  // Get dashboard data for pending count badge
  const { data: dashboardData } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboard,
    staleTime: 60 * 1000,
  });

  // Get subscriptions
  const queryParams = { status: activeTab, page, limit };
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', queryParams],
    queryFn: () => adminApi.getSubscriptions(queryParams),
    staleTime: 60 * 1000,
  });

  // Handle Tab change -> Reset page
  const handleTabChange = (tab: SubscriptionStatus) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Mutation cho cập nhật Subscription (Optimistic Update)
  const updateMutation = useMutation({
    mutationFn: ({ subId, ...body }: { subId: string; status: 'APPROVED' | 'REJECTED'; plan?: SubscriptionPlan; rejectReason?: string }) => 
      adminApi.updateSubscription({ subId, body }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'dashboard'] });
      await queryClient.cancelQueries({ queryKey: ['admin', 'subscriptions'] });

      const prevDashboard = queryClient.getQueryData(['admin', 'dashboard']);

      queryClient.setQueryData(['admin', 'dashboard'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pendingSubscriptions: Math.max(0, old.pendingSubscriptions - 1)
        };
      });

      return { prevDashboard };
    },
    onError: (error: any, variables, context) => {
      // Revert lại dashboard count
      if (context?.prevDashboard) {
        queryClient.setQueryData(['admin', 'dashboard'], context.prevDashboard);
      }
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    },
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'APPROVED' ? 'Đã duyệt gói VIP' : 'Đã từ chối yêu cầu');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setApproveSub(null);
      setRejectSub(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteSubscription,
    onSuccess: () => {
      toast.success('Đã xóa yêu cầu thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      setDeleteSubId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa yêu cầu. Vui lòng thử lại.');
    }
  });

  const handleApproveConfirm = (plan: SubscriptionPlan) => {
    if (!approveSub) return;
    updateMutation.mutate({ subId: approveSub.id, status: 'APPROVED', plan });
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectSub) return;
    updateMutation.mutate({ subId: rejectSub.id, status: 'REJECTED', rejectReason: reason });
  };

  return (
    <div className="space-y-6">
      <SubscriptionTabs
        activeTab={activeTab}
        onChange={handleTabChange}
        pendingCount={dashboardData?.pendingSubscriptions}
      />

      <SubscriptionTable
        subscriptions={data?.subscriptions || []}
        activeTab={activeTab}
        isLoading={isLoading}
        onApprove={(sub) => setApproveSub(sub)}
        onReject={(sub) => setRejectSub(sub)}
        onDelete={(id) => setDeleteSubId(id)}
        onViewImage={(url) => setLightboxUrl(url)}
      />

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Hiển thị <span className="font-medium">{data.subscriptions.length}</span> trên tổng số{' '}
            <span className="font-medium">{data.pagination.total}</span> yêu cầu
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trang trước
            </Button>
            <span className="text-sm px-4">
              {page} / {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <ImageLightbox
        imageUrl={lightboxUrl}
        isOpen={!!lightboxUrl}
        onClose={() => setLightboxUrl('')}
      />

      {/* Action Dialogs */}
      <ApproveDialog
        subscription={approveSub}
        isOpen={!!approveSub}
        onClose={() => setApproveSub(null)}
        onConfirm={handleApproveConfirm}
        isPending={updateMutation.isPending}
      />

      <RejectDialog
        subscription={rejectSub}
        isOpen={!!rejectSub}
        onClose={() => setRejectSub(null)}
        onConfirm={handleRejectConfirm}
        isPending={updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deleteSubId}
        onOpenChange={(open) => !open && setDeleteSubId(null)}
        onConfirm={() => deleteSubId && deleteMutation.mutate(deleteSubId)}
        isLoading={deleteMutation.isPending}
        description="Dữ liệu về yêu cầu nâng cấp VIP này sẽ bị xóa vĩnh viễn khỏi hệ thống."
      />
    </div>
  );
}
