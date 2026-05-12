import { Link } from 'react-router';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { NotificationBell } from './NotificationBell';
import { User, LogOut } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/useLogout';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const { handleLogout, isLoggingOut } = useLogout();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2" replace={true}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
              TOEIC Master
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
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
