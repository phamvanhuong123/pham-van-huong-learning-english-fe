import { Link, NavLink } from 'react-router';
import { NotificationBell } from './NotificationBell';
import { User, LogOut, LayoutDashboard, BookOpen, History, Library, BarChart3, Crown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/useLogout';
import { useRole } from '@/hooks/useRole';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, isVIP, isAdmin, isAtLeastVIP } = useRole();
  const { handleLogout, isLoggingOut } = useLogout();

  const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Luyện đề', to: '/exams', icon: Library },
    { label: 'Lịch sử', to: '/history', icon: History },
    { label: 'Từ vựng', to: '/vocab', icon: BookOpen },
    { label: 'Phân tích', to: '/analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2" replace={true}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight hidden lg:inline-block">
              TOEIC Master
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!isAtLeastVIP && (
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden lg:flex gap-2 border-primary/30 text-primary hover:bg-primary/5 rounded-full"
              asChild
            >
              <Link to="/pricing">
                <Crown className="h-4 w-4" />
                {isVIP ? 'Extend VIP' : 'Go VIP'}
              </Link>
            </Button>
          )}
          <NotificationBell />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 px-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm font-medium hidden md:inline-block">
                  {user?.name || user?.email.split('@')[0]}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="flex flex-col gap-1">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Tài khoản: <span className="font-medium text-foreground">{user?.email}</span>
                </div>
                <div className="h-px bg-border my-1" />
                <Link to="/profile" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted">
                  <User className="h-4 w-4" /> Hồ sơ
                </Link>
                {!isAdmin && (
                  <Link to="/pricing" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted text-primary font-medium">
                    <Crown className="h-4 w-4" /> {isVIP ? 'Gia hạn VIP' : 'Nâng cấp VIP'}
                  </Link>
                )}
                <div className="h-px bg-border my-1" />
                <Button variant="ghost" size="sm" className="justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout} disabled={isLoggingOut}>
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
