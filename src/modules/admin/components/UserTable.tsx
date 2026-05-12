import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Key, ShieldCheck } from 'lucide-react';
import type { AdminUserItem } from '@/types/admin';

interface UserTableProps {
  users: AdminUserItem[];
  onEdit: (user: AdminUserItem) => void;
  onResetPassword: (user: AdminUserItem) => void;
  isLoading?: boolean;
}

export function UserTable({ users, onEdit, onResetPassword, isLoading }: UserTableProps) {
  if (isLoading) {
    return (
      <div className="border border-border rounded-lg bg-card p-8 text-center text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="border border-border rounded-lg bg-card p-12 text-center text-muted-foreground">
        Không tìm thấy người dùng nào phù hợp.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Người dùng</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày đăng ký</TableHead>
            <TableHead className="text-right">Bài đã làm</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="font-semibold text-primary">{user.email.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col max-w-[200px] sm:max-w-xs overflow-hidden">
                    <span className="font-medium truncate">{user.name || 'Người dùng ẩn danh'}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {user.role === 'ADMIN' ? (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 rounded-sm px-2">
                    <ShieldCheck className="w-3 h-3" /> ADMIN
                  </Badge>
                ) : user.role === 'VIP' ? (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 rounded-sm px-2">
                    VIP
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border rounded-sm px-2">
                    STANDARD
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {user.isBanned ? (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-destructive">Banned</span>
                    {user.banReason && <span className="text-xs text-muted-foreground line-clamp-1 max-w-[150px]" title={user.banReason}>{user.banReason}</span>}
                  </div>
                ) : (
                  <span className="text-sm font-medium text-success">Active</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </TableCell>
              <TableCell className="text-right font-medium">
                {user.examCount}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-primary"
                    onClick={() => onResetPassword(user)}
                    title="Đặt lại mật khẩu"
                  >
                    <Key className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-primary"
                    onClick={() => onEdit(user)}
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
