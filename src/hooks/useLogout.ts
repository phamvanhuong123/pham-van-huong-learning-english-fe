import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import api from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // We still clear the auth store and navigate even if the API fails
    } finally {
      clearAuth();
      queryClient.clear(); // Clear all cached data
      setIsLoggingOut(false);
      toast.success('Đăng xuất thành công');
      navigate('/login', { replace: true });
    }
  };

  return { handleLogout, isLoggingOut };
}
