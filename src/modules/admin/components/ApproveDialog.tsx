import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { AdminSubscriptionItem, SubscriptionPlan } from '@/types/admin';

interface ApproveDialogProps {
  subscription: AdminSubscriptionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (plan: SubscriptionPlan) => void;
  isPending: boolean;
}

const PLANS: { value: SubscriptionPlan; label: string; price: string }[] = [
  { value: '1m', label: '1 tháng', price: '99,000đ' },
  { value: '3m', label: '3 tháng', price: '249,000đ' },
  { value: '12m', label: '12 tháng', price: '899,000đ' },
];

export function ApproveDialog({
  subscription,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: ApproveDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | ''>('');

  useEffect(() => {
    if (isOpen) {
      // Tự động detect plan từ dữ liệu nếu có, không thì empty
      setSelectedPlan((subscription?.plan as SubscriptionPlan) || '');
    }
  }, [isOpen, subscription]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Duyệt gói VIP</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Vui lòng xác nhận gói VIP sẽ được cấp cho tài khoản{' '}
            <span className="font-semibold text-foreground">{subscription?.user.email}</span>
          </p>

          <div className="space-y-3 mt-4">
            <Label className="text-sm font-semibold">Chọn gói đăng ký</Label>
            <div className="grid gap-2">
              {PLANS.map((plan) => (
                <label
                  key={plan.value}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedPlan === plan.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="vip-plan"
                      value={plan.value}
                      checked={selectedPlan === plan.value}
                      onChange={() => setSelectedPlan(plan.value)}
                      className="w-4 h-4 text-primary bg-background border-input focus:ring-primary focus:ring-offset-background"
                    />
                    <span className="font-medium text-foreground">{plan.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">{plan.price}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button
            onClick={() => selectedPlan && onConfirm(selectedPlan as SubscriptionPlan)}
            disabled={!selectedPlan || isPending}
          >
            {isPending ? 'Đang xử lý...' : 'Xác nhận duyệt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
