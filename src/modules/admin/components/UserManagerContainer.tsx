import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { UserTable } from './UserTable';
import { UserEditSheet } from './UserEditSheet';
import { UserResetPasswordDialog } from './UserResetPasswordDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminUserItem } from '@/types/admin';

export function UserManagerContainer() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');

  const [selectedEditUser, setSelectedEditUser] = useState<AdminUserItem | null>(null);
  const [selectedResetUser, setSelectedResetUser] = useState<AdminUserItem | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Handle filter changes (reset page)
  const handleRoleChange = (val: string) => {
    setRole(val);
    setPage(1);
  };
  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const queryParams = {
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(role !== 'ALL' && { role }),
    ...(status !== 'ALL' && { status }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', queryParams],
    queryFn: () => adminApi.getUsers(queryParams),
    staleTime: 60 * 1000,
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <Select value={role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả vai trò</SelectItem>
              <SelectItem value="STANDARD">Standard</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <UserTable
        users={data?.users || []}
        isLoading={isLoading}
        onEdit={(user) => setSelectedEditUser(user)}
        onResetPassword={(user) => setSelectedResetUser(user)}
      />

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Hiển thị <span className="font-medium">{data.users.length}</span> trên tổng số{' '}
            <span className="font-medium">{data.pagination.total}</span> người dùng
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

      {/* Modals/Drawers - Mounted once, toggled via isOpen prop */}
      <UserEditSheet
        user={selectedEditUser}
        isOpen={!!selectedEditUser}
        onClose={() => setSelectedEditUser(null)}
      />
      <UserResetPasswordDialog
        user={selectedResetUser}
        isOpen={!!selectedResetUser}
        onClose={() => setSelectedResetUser(null)}
      />
    </div>
  );
}
