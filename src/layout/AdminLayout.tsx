import { NavLink, Outlet } from 'react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  Bell,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  FileText,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/useLogout';
import { adminApi } from '@/services/adminApi';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badgeKey?: 'pendingSubscriptions';
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Người dùng', to: '/admin/users', icon: <Users className="w-4 h-4" /> },
  {
    label: 'Đăng ký VIP',
    to: '/admin/subscriptions',
    icon: <CreditCard className="w-4 h-4" />,
    badgeKey: 'pendingSubscriptions',
  },
  { label: 'Quản lý đề thi', to: '/admin/exams', icon: <FileText className="w-4 h-4" /> },
  { label: 'Ngân hàng câu hỏi', to: '/admin/questions', icon: <BookOpen className="w-4 h-4" /> },
  { label: 'Thông báo', to: '/admin/notifications', icon: <Bell className="w-4 h-4" /> },
  { label: 'Thùng rác', to: '/admin/trash', icon: <Trash2 className="w-4 h-4" /> },
];

function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const { handleLogout, isLoggingOut } = useLogout();
  
  // Fetch dashboard để lấy pendingSubscriptions cho badge
  const { data } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboard,
    staleTime: 60 * 1000,
  });

  const pendingCount = data?.pendingSubscriptions ?? 0;

  const getBadgeValue = (badgeKey?: 'pendingSubscriptions') => {
    if (badgeKey === 'pendingSubscriptions') return pendingCount;
    return 0;
  };

  return (
    <aside className="flex flex-col h-full bg-card border-r border-border w-60">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
          <ShieldCheck className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">TOEIC Master</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8 lg:hidden"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => {
          const badgeValue = getBadgeValue(item.badgeKey);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-150 relative',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
              aria-current={({ isActive }: { isActive: boolean }) =>
                isActive ? 'page' : undefined
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {badgeValue > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 min-w-5 px-1.5 text-xs rounded-full"
                  aria-label={`${badgeValue} mục chờ xử lý`}
                >
                  {badgeValue > 99 ? '99+' : badgeValue}
                </Badge>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          {isLoggingOut ? 'Đang xuất...' : 'Đăng xuất'}
        </Button>
        <p className="text-xs text-center text-muted-foreground">Admin Panel v1.0</p>
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar — cố định bên trái */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="relative z-50 flex h-full w-60">
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở menu"
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Admin Panel</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
