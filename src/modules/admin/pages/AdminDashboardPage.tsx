import { useQuery } from '@tanstack/react-query';
import { Users, Crown, BookOpen, Activity, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { adminApi } from '@/services/adminApi';
import type { AdminDashboardStats, DailySignup } from '@/types/admin';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── MetricCardSkeleton ──────────────────────────────────────────────────────

function MetricCardSkeleton() {
  return (
    <div className="border border-border bg-card rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// ─── MetricCard ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  description: string;
}

function MetricCard({ label, value, icon, iconBg, description }: MetricCardProps) {
  return (
    <div className="border border-border bg-card rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <div className={cn('p-2 rounded-lg', iconBg)}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value.toLocaleString('vi-VN')}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── AdminMetricCards ────────────────────────────────────────────────────────

function AdminMetricCards({ stats }: { stats: AdminDashboardStats | undefined }) {
  const metrics: MetricCardProps[] = stats
    ? [
        {
          label: 'Tổng người dùng',
          value: stats.totalUsers,
          icon: <Users className="w-4 h-4 text-primary" />,
          iconBg: 'bg-primary/10',
          description: 'Tất cả tài khoản đã đăng ký',
        },
        {
          label: 'Người dùng VIP',
          value: stats.vipUsers,
          icon: <Crown className="w-4 h-4 text-warning" />,
          iconBg: 'bg-warning/10',
          description: 'Đang có gói VIP hoạt động',
        },
        {
          label: 'Bài thi hôm nay',
          value: stats.examsToday,
          icon: <BookOpen className="w-4 h-4 text-success" />,
          iconBg: 'bg-success/10',
          description: 'Lượt làm bài trong ngày',
        },
        {
          label: 'Hoạt động 7 ngày',
          value: stats.activeUsers7d,
          icon: <Activity className="w-4 h-4 text-info" />,
          iconBg: 'bg-info/10',
          description: 'User có hoạt động trong 7 ngày qua',
        },
      ]
    : [];

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      aria-label="Thống kê tổng quan"
    >
      {!stats
        ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        : metrics.map((m) => <MetricCard key={m.label} {...m} />)}
    </div>
  );
}

// ─── DailySignupChart ────────────────────────────────────────────────────────

function DailySignupChartSkeleton() {
  return (
    <div className="border border-border bg-card rounded-xl p-6">
      <Skeleton className="h-5 w-48 mb-6" />
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </div>
  );
}

function DailySignupChart({ data }: { data: DailySignup[] | undefined }) {
  if (!data) return <DailySignupChartSkeleton />;

  // Format label: chỉ hiện ngày/tháng, mỗi 5 ngày
  const formattedData = data.map((d, i) => ({
    ...d,
    displayDate: i % 5 === 0 ? d.date.slice(5) : '', // 'MM-DD'
  }));

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className="border border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Đăng ký mới — 30 ngày gần nhất
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={formattedData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={false}
              domain={[0, maxCount + 1]}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '13px',
              }}
              labelFormatter={(label) => `Ngày ${label}`}
              formatter={(value: any) => [value, 'Đăng ký mới']}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#2563EB"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#2563EB' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ─── AlertCard ───────────────────────────────────────────────────────────────

interface AlertCardProps {
  count: number;
  label: string;
  to: string;
}

function AlertCard({ count, label, to }: AlertCardProps) {
  // Chỉ hiển thị nếu count > 0
  if (count === 0) return null;

  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl border border-warning/40 bg-warning/10"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">
          <span className="font-bold text-warning">{count}</span> {label}
        </p>
      </div>
      <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/90 gap-1">
        <Link to={to}>
          Xem ngay
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}

// ─── AdminDashboardPage ──────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboard,
    staleTime: 60 * 1000,
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tổng quan hệ thống</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Theo dõi hoạt động và quản lý toàn bộ nền tảng TOEIC Master.
        </p>
      </div>

      {/* Metric Cards — skeleton riêng, không block chart hay alert */}
      <AdminMetricCards stats={data?.stats} />

      {/* Daily Signup Chart — render độc lập */}
      {isLoading ? (
        <DailySignupChartSkeleton />
      ) : (
        <DailySignupChart data={data?.dailySignups} />
      )}

      {/* Alert Cards — chỉ hiện nếu count > 0, render độc lập */}
      {!isLoading && (
        <section className="space-y-3" aria-label="Cảnh báo cần xử lý">
          <AlertCard
            count={data?.pendingSubscriptions ?? 0}
            label="Yêu cầu VIP đang chờ duyệt"
            to="/admin/subscriptions"
          />
          <AlertCard
            count={data?.openReports ?? 0}
            label="Báo cáo lỗi chưa được xử lý"
            to="/admin/notifications"
          />
        </section>
      )}
    </div>
  );
}
