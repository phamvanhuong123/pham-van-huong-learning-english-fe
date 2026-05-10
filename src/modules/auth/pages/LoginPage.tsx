
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, Navigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Nếu đã đăng nhập, redirect về dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const { mutate: loginMutation, isPending, error: mutationError } = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      const { accessToken, user: userData } = data;
      setAuth(userData, accessToken);
      navigate('/dashboard');
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation(data);
  };

  const errorMessage = mutationError ? ((mutationError as any).response?.data?.message || 'Đã có lỗi xảy ra') : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>
          Nhập email và mật khẩu của bạn để truy cập tài khoản.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {errorMessage}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" {...register('email')} disabled={isPending} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <Input id="password" type="password" {...register('password')} disabled={isPending} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginPage;
