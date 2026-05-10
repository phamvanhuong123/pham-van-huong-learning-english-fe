import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

/**
 * VerifyEmailPage — xử lý route /verify-email?token=...
 *
 * Luồng:
 * 1. Lấy token từ query string
 * 2. Tự động gọi API POST /auth/verify-email khi mount
 * 3. Hiển thị 3 trạng thái: loading → success → error
 */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: async (tkn: string) => {
      const response = await api.post('/auth/verify-email', { token: tkn });
      return response.data;
    },
  });

  // Gọi API ngay khi component mount
  useEffect(() => {
    if (token) {
      mutate(token);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errorMessage = error
    ? ((error as any).response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  // ── Không có token trong URL ───────────────────────────────────
  if (!token) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <span className="text-5xl">⚠️</span>
          </div>
          <CardTitle className="text-center">Liên kết không hợp lệ</CardTitle>
          <CardDescription className="text-center">
            Không tìm thấy token xác thực trong đường dẫn. Vui lòng kiểm tra lại email của bạn.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline">
            <Link to="/login">Về trang đăng nhập</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // ── Đang xác thực ─────────────────────────────────────────────
  if (isPending) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Đang xác thực email của bạn...</p>
        </CardContent>
      </Card>
    );
  }

  // ── Xác thực thành công ────────────────────────────────────────
  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <span className="text-4xl">✅</span>
            </div>
          </div>
          <CardTitle className="text-center">Xác thực thành công!</CardTitle>
          <CardDescription className="text-center">
            Email của bạn đã được xác thực. Tài khoản đã sẵn sàng, hãy đăng nhập để bắt đầu!
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild className="w-full">
            <Link to="/login">Đăng nhập ngay</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // ── Xác thực thất bại ─────────────────────────────────────────
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-4xl">❌</span>
            </div>
          </div>
          <CardTitle className="text-center">Xác thực thất bại</CardTitle>
          <CardDescription className="text-center">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Link xác thực chỉ có hiệu lực trong <strong>24 giờ</strong>.
            Nếu link đã hết hạn, hãy đăng ký lại để nhận email mới.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link to="/register">Đăng ký lại</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">Về trang đăng nhập</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
};

export default VerifyEmailPage;
