import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { mutate: forgotPasswordMutation, isPending, data: successData, error: mutationError } = useMutation({
    mutationFn: async (data: ForgotPasswordFormValues) => {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    }
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    forgotPasswordMutation(data);
  };

  const errorMessage = mutationError ? ((mutationError as any).response?.data?.message || 'Đã có lỗi xảy ra') : null;
  const successMsg = successData?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quên mật khẩu</CardTitle>
        <CardDescription>
          Nhập email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMsg ? (
          <div className="bg-emerald-50 text-emerald-600 text-sm p-4 rounded-md mb-4 text-center">
            {successMsg}
          </div>
        ) : (
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Đang gửi...' : 'Gửi link khôi phục'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" asChild className="text-muted-foreground">
          <Link to="/login">Quay lại Đăng nhập</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordPage;
