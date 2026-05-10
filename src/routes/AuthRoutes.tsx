import { Route } from 'react-router';
import AuthLayout from '../modules/auth/components/AuthLayout';
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import ForgotPasswordPage from '../modules/auth/pages/ForgotPasswordPage';
import VerifyEmailPage from '../modules/auth/pages/VerifyEmailPage';

function AuthRoutes() {
  return (
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
    </Route>
  );
}

export default AuthRoutes;
