import { useNavigate } from 'react-router';
import { Crown, Zap, BookOpen, BarChart3, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VIPStatusCardProps {
  role: string;
  vipExpiresAt: string | null;
}

const VIP_BENEFITS = [
  { icon: BookOpen, text: 'Làm đề Premium không giới hạn' },
  { icon: Zap, text: 'Lưu từ vựng không giới hạn' },
  { icon: BarChart3, text: 'Phân tích lỗi chi tiết theo chủ đề' },
];

export function VIPStatusCard({ role, vipExpiresAt }: VIPStatusCardProps) {
  const navigate = useNavigate();
  const isVIP = role === 'VIP' || role === 'ADMIN';

  if (isVIP) {
    const expiryText = vipExpiresAt
      ? new Intl.DateTimeFormat('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date(vipExpiresAt))
      : null;

    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-success/15">
            <Crown className="h-5 w-5 text-success" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge
                className="bg-success/10 text-success border-0 font-semibold text-xs"
                aria-label="Trạng thái VIP"
              >
                VIP Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {expiryText ? `Hết hạn: ${expiryText}` : 'Không giới hạn'}
            </p>
          </div>
        </div>
        <Crown className="h-8 w-8 text-success/30" aria-hidden="true" />
      </div>
    );
  }

  // Standard user — upgrade banner
  return (
    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Nâng cấp VIP để mở khóa:</h3>
      </div>

      <ul className="space-y-2">
        {VIP_BENEFITS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2.5 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <Button
        id="profile-upgrade-vip-btn"
        className="w-full font-semibold"
        onClick={() => navigate('/dashboard/profile?tab=billing')}
        aria-label="Nâng cấp tài khoản VIP"
      >
        <Crown className="h-4 w-4 mr-1.5" />
        Nâng cấp ngay →
      </Button>
    </div>
  );
}
