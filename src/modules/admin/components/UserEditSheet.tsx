import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi } from '@/services/adminApi';
import type { AdminUserItem, UserRole } from '@/types/admin';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';

interface UserEditSheetProps {
  user: AdminUserItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserEditSheet({ user, isOpen, onClose }: UserEditSheetProps) {
  const queryClient = useQueryClient();
  const currentAdmin = useAuthStore((state) => state.user);

  const [role, setRole] = useState<UserRole>('STANDARD');
  const [vipExpiresAt, setVipExpiresAt] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [errors, setErrors] = useState<{ banReason?: string }>({});

  // Sync state when user changes
  useEffect(() => {
    if (user && isOpen) {
      setRole(user.role);
      setVipExpiresAt(user.vipExpiresAt ? user.vipExpiresAt.split('T')[0] : '');
      setIsBanned(user.isBanned);
      setBanReason(user.banReason || '');
      setErrors({});
    }
  }, [user, isOpen]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await adminApi.updateUser({
        userId: user.id,
        body: {
          role,
          vipExpiresAt: role === 'VIP' ? (vipExpiresAt ? new Date(vipExpiresAt).toISOString() : null) : null,
          isBanned,
          banReason: isBanned ? banReason : null,
        },
      });
    },
    onSuccess: () => {
      toast.success('Cập nhật người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  const handleSave = () => {
    // Validation
    if (isBanned && !banReason.trim()) {
      setErrors({ banReason: 'Vui lòng nhập lý do khóa tài khoản' });
      return;
    }
    updateMutation.mutate();
  };

  const isSelfEdit = user?.id === currentAdmin?.id;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Chỉnh sửa người dùng</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin và quyền hạn của người dùng. Nhấn lưu khi hoàn tất.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4 py-6">
          {/* User Info Card */}
          {user && (
            <div className="grid gap-3 p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name || 'Chưa đặt tên'}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Role Section */}
          <div className="grid gap-3">
            <Label htmlFor="user-role">Vai trò</Label>
            {!isSelfEdit ? (
              <Select value={role} onValueChange={(val: UserRole) => setRole(val)}>
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">●</span>
                      <span>Standard</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="VIP">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600">★</span>
                      <span>VIP</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600">♛</span>
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-md border border-muted bg-muted/50 p-3 text-sm">
                <span className="font-medium text-primary">{user?.role}</span>
                <span className="text-muted-foreground ml-2">(Không thể tự sửa)</span>
              </div>
            )}
          </div>

          {/* VIP Expiry */}
          {role === 'VIP' && (
            <div className="grid gap-3">
              <Label htmlFor="vip-expires">Ngày hết hạn VIP</Label>
              <Input
                id="vip-expires"
                type="date"
                value={vipExpiresAt}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setVipExpiresAt(e.target.value)}
              />
              {vipExpiresAt && (
                <p className="text-xs text-muted-foreground">
                  Hết hạn: {new Date(vipExpiresAt).toLocaleDateString('vi-VN', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </p>
              )}
            </div>
          )}

          {/* Ban Section */}
          {!isSelfEdit && (
            <>
              <div className="grid gap-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ban-toggle" className="text-base font-semibold">
                      Khóa tài khoản
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ngăn chặn người dùng đăng nhập
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="ban-toggle"
                      type="checkbox"
                      className="sr-only peer"
                      checked={isBanned}
                      onChange={(e) => {
                        setIsBanned(e.target.checked);
                        if (!e.target.checked) setErrors({});
                      }}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-destructive"></div>
                  </label>
                </div>
              </div>

              {isBanned && (
                <div className="grid gap-3">
                  <Label htmlFor="ban-reason">
                    Lý do khóa <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    id="ban-reason"
                    className={`flex min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                      errors.banReason ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                    }`}
                    placeholder="Nhập lý do khóa tài khoản..."
                    value={banReason}
                    onChange={(e) => {
                      setBanReason(e.target.value);
                      if (e.target.value.trim()) setErrors({});
                    }}
                  />
                  {errors.banReason && (
                    <p className="text-xs text-destructive">{errors.banReason}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <SheetFooter>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={updateMutation.isPending || (isSelfEdit && !user)}
          >
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" disabled={updateMutation.isPending}>
              Đóng
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
