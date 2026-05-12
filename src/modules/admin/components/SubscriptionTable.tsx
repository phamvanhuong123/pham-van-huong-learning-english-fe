import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X, Image as ImageIcon } from 'lucide-react';
import type { AdminSubscriptionItem, SubscriptionStatus } from '@/types/admin';

interface SubscriptionTableProps {
  subscriptions: AdminSubscriptionItem[];
  activeTab: SubscriptionStatus;
  isLoading?: boolean;
  onApprove: (sub: AdminSubscriptionItem) => void;
  onReject: (sub: AdminSubscriptionItem) => void;
  onViewImage: (url: string) => void;
}

export function SubscriptionTable({
  subscriptions,
  activeTab,
  isLoading,
  onApprove,
  onReject,
  onViewImage,
}: SubscriptionTableProps) {
  // Trạng thái load ảnh lỗi để show placeholder
  const [imgErrorIds, setImgErrorIds] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg bg-card p-8 text-center text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="border border-border rounded-lg bg-card p-12 text-center text-muted-foreground">
        Không có yêu cầu nào trong mục này.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Người dùng</TableHead>
            <TableHead>Ngày yêu cầu</TableHead>
            {activeTab !== 'PENDING' && <TableHead>Gói / Lý do</TableHead>}
            <TableHead>Ảnh xác nhận</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {sub.user.avatarUrl ? (
                      <img src={sub.user.avatarUrl} alt={sub.user.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="font-semibold text-primary">{sub.user.email.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col max-w-[200px] sm:max-w-xs overflow-hidden">
                    <span className="font-medium truncate">{sub.user.name || 'Người dùng ẩn danh'}</span>
                    <span className="text-xs text-muted-foreground truncate">{sub.user.email}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
                <br />
                <span className="text-xs">{new Date(sub.createdAt).toLocaleTimeString('vi-VN')}</span>
              </TableCell>

              {activeTab !== 'PENDING' && (
                <TableCell>
                  {activeTab === 'APPROVED' ? (
                    <span className="font-medium text-success">{sub.plan === '1m' ? '1 Tháng' : sub.plan === '3m' ? '3 Tháng' : '12 Tháng'}</span>
                  ) : (
                    <div className="text-sm text-destructive line-clamp-2 max-w-[200px]" title={sub.rejectReason || ''}>
                      {sub.rejectReason || 'Không có lý do'}
                    </div>
                  )}
                </TableCell>
              )}

              <TableCell>
                {sub.proofImageUrl && !imgErrorIds.has(sub.id) ? (
                  <div
                    className="w-16 h-12 rounded-md overflow-hidden cursor-pointer border border-border hover:opacity-80 transition-opacity"
                    onClick={() => onViewImage(sub.proofImageUrl!)}
                  >
                    <img
                      src={sub.proofImageUrl}
                      alt="Proof"
                      className="w-full h-full object-cover"
                      onError={() => setImgErrorIds((prev) => new Set(prev).add(sub.id))}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted p-2 rounded-md w-max">
                    <ImageIcon className="w-4 h-4" />
                    Không tải được ảnh
                  </div>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  {activeTab === 'PENDING' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-success hover:bg-success/10 hover:text-success hover:border-success/30"
                        onClick={() => onApprove(sub)}
                        title="Duyệt VIP"
                      >
                        <Check className="w-4 h-4 mr-1" /> Duyệt
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        onClick={() => onReject(sub)}
                        title="Từ chối"
                      >
                        <X className="w-4 h-4 mr-1" /> Từ chối
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-muted-foreground"
                      onClick={() => sub.proofImageUrl && onViewImage(sub.proofImageUrl)}
                      disabled={!sub.proofImageUrl || imgErrorIds.has(sub.id)}
                    >
                      <ImageIcon className="w-4 h-4 mr-1.5" /> Xem ảnh
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
