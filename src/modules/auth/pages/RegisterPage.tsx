import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';

const registerSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên của bạn"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(/\d/, "Mật khẩu phải chứa ít nhất 1 chữ số"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate: registerMutation, isPending, isSuccess, error: mutationError } = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      return response.data;
    }
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation(data);
  };

  const errorMessage = mutationError ? ((mutationError as any).response?.data?.message || 'Đã có lỗi xảy ra') : null;

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kiểm tra email của bạn</CardTitle>
          <CardDescription>
            Chúng tôi đã gửi một đường link xác thực tài khoản vào email của bạn. Vui lòng kiểm tra hộp thư đến (và thư mục spam).
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link to="/login">Trở lại trang Đăng nhập</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký tài khoản</CardTitle>
        <CardDescription>
          Tạo tài khoản để bắt đầu hành trình học tiếng Anh.
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
            <Label htmlFor="name">Họ và tên</Label>
            <Input id="name" placeholder="Nguyễn Văn A" {...register('name')} disabled={isPending} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" {...register('email')} disabled={isPending} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" {...register('password')} disabled={isPending} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} disabled={isPending} />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Đang xử lý...' : 'Đăng ký'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Đăng nhập
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterPage;

