import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../../modules/auth/store/useAuthStore';

interface ProtectedRouteProps {
  requiredRole?: 'STANDARD' | 'VIP' | 'ADMIN';
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roleHierarchy = { STANDARD: 1, VIP: 2, ADMIN: 3 };
    const userRoleValue = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleValue = roleHierarchy[requiredRole] || 0;

    if (userRoleValue < requiredRoleValue) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
