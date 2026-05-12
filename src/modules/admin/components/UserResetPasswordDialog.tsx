import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface UserResetPasswordDialogProps {
  user: { id: string; name: string; email: string } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserResetPasswordDialog({
  user,
  isOpen,
  onClose,
}: UserResetPasswordDialogProps) {
  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Gọi endpoint gửi email reset password, có thể reuse api auth
      await api.post('/auth/forgot-password', { email: user?.email });
    },
    onSuccess: () => {
      toast.success('Đã gửi email đặt lại mật khẩu');
      onClose();
    },
    onError: () => {
      toast.error('Gửi email thất bại. Vui lòng thử lại.');
    },
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Đặt lại mật khẩu</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn gửi email hướng dẫn đặt lại mật khẩu cho{' '}
            <span className="font-semibold text-foreground">{user?.email}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={resetPasswordMutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (user) resetPasswordMutation.mutate(user.id);
            }}
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? 'Đang gửi...' : 'Gửi email'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
