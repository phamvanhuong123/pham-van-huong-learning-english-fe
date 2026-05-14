import { Route, Navigate } from 'react-router';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminLayout from '@/layout/AdminLayout';
import AdminDashboardPage from '@/modules/admin/pages/AdminDashboardPage';
import UserManagerPage from '@/modules/admin/pages/UserManagerPage';
import SubscriptionManagerPage from '@/modules/admin/pages/SubscriptionManagerPage';
import QuestionBankPage from '@/modules/admin/pages/QuestionBankPage';
import ExamManagementPage from '@/modules/admin/pages/ExamManagementPage';
import AdminNotificationsPage from '@/modules/admin/pages/AdminNotificationsPage';
import TrashManagerPage from '@/modules/admin/pages/TrashManagerPage';
import AdminVocabPage from '@/modules/admin/pages/AdminVocabPage';
import AdminGrammarPage from '@/modules/admin/pages/AdminGrammarPage';

function AdminRoutes() {
  return (
    <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN" />}>
      {/* Layer 2: Layout — sidebar + main content */}
      <Route element={<AdminLayout />}>
        {/* Redirect /admin → /admin/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<UserManagerPage />} />
        <Route path="subscriptions" element={<SubscriptionManagerPage />} />
        <Route path="questions" element={<QuestionBankPage />} />
        <Route path="exams" element={<ExamManagementPage />} />
        <Route path="vocab" element={<AdminVocabPage />} />
        <Route path="grammar" element={<AdminGrammarPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="trash" element={<TrashManagerPage />} />
      </Route>
    </Route>
  );
}

export default AdminRoutes;

