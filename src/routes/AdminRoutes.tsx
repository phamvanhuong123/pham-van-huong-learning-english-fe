import { Route, Navigate } from 'react-router';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminLayout from '@/layout/AdminLayout';
import AdminDashboardPage from '@/modules/admin/pages/AdminDashboardPage';
import UserManagerPage from '@/modules/admin/pages/UserManagerPage';
import SubscriptionManagerPage from '@/modules/admin/pages/SubscriptionManagerPage';
import QuestionBankPage from '@/modules/admin/pages/QuestionBankPage';
import AdminNotificationsPage from '@/modules/admin/pages/AdminNotificationsPage';

/**
 * Admin Routes
 * ProtectedRoute (requiredRole="ADMIN") bọc ngoài → render Outlet khi hợp lệ
 * AdminLayout là element của route con ngay trong → render Outlet cho pages
 */
function AdminRoutes() {
  return (
    // Layer 1: Guard — chỉ ADMIN mới vào được
    <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN" />}>
      {/* Layer 2: Layout — sidebar + main content */}
      <Route element={<AdminLayout />}>
        {/* Redirect /admin → /admin/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<UserManagerPage />} />
        <Route path="subscriptions" element={<SubscriptionManagerPage />} />
        <Route path="questions" element={<QuestionBankPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
      </Route>
    </Route>
  );
}

export default AdminRoutes;

