import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';

/**
 * Hook khởi tạo app: tự động refresh accessToken khi trang được load lại
 * nếu user đã tồn tại trong store (persisted từ localStorage).
 *
 * Flow:
 * 1. App load → user có trong store (từ localStorage), nhưng accessToken = null
 * 2. Hook gọi /auth/refresh (dùng httpOnly cookie) → nhận accessToken mới
 * 3. Cập nhật store → mọi API call sau đó đều có Authorization header
 * 4. Nếu refresh thất bại (cookie hết hạn) → clearAuth → redirect login
 */
export function useAppInit() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const hasRun = useRef(false);

  useEffect(() => {
    // Chỉ chạy 1 lần khi mount
    if (hasRun.current) return;
    hasRun.current = true;

    // Chỉ refresh nếu: có user (đã login trước đó) nhưng không có accessToken
    if (user && !accessToken) {
      axios
        .post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        .then((res) => {
          const newAccessToken = res.data.accessToken;
          const updatedUser = res.data.user;
          if (newAccessToken && updatedUser) {
            setAuth(updatedUser, newAccessToken);
          }
        })
        .catch(() => {
          // Refresh token cookie hết hạn hoặc invalid → buộc logout
          clearAuth();
        });
    }
  }, [user, accessToken, setAuth, clearAuth]);
}
