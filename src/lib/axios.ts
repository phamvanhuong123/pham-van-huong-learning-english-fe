import axios from 'axios';
import { useAuthStore } from '../modules/auth/store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Xử lý tự động refresh token khi nhận lỗi 401 TOKEN_EXPIRED
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = res.data.accessToken;
        
        // Cập nhật store bằng token mới
        useAuthStore.setState((state) => ({
          ...state,
          accessToken: newAccessToken
        }));
        
        // Gắn lại token mới và retry request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token cũng lỗi/hết hạn -> văng ra login
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Nếu lỗi 401 không phải do token expired hoặc đã retry mà vẫn lỗi
    if (error.response?.status === 401 && !originalRequest._retry) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
