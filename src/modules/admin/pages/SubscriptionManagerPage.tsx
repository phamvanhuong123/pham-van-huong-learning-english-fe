import { SubscriptionManagerContainer } from '../components/SubscriptionManagerContainer';

export default function SubscriptionManagerPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý đăng ký VIP</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Xử lý yêu cầu nâng cấp VIP, xem xét ảnh biên lai chuyển khoản.
        </p>
      </div>

      <SubscriptionManagerContainer />
    </div>
  );
}

