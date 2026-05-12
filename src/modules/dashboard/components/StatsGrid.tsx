import { BookOpen, Trophy, BookMarked, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { StatsGridProps } from '@/types/dashboard';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
}

function StatCard({ icon, label, value, sub, iconBg, iconColor }: StatCardProps) {
  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground font-medium truncate">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsGrid({ stats }: StatsGridProps) {
  const { totalExamsDone, averageScore, vocabCount, accuracyByPart } = stats;

  // Calculate average accuracy (only from parts that have data)
  const accuracyValues = [accuracyByPart.PART5, accuracyByPart.PART6, accuracyByPart.PART7].filter(
    (v): v is number => v !== null
  );
  const avgAccuracy =
    accuracyValues.length > 0
      ? Math.round(accuracyValues.reduce((a, b) => a + b, 0) / accuracyValues.length)
      : null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        icon={<BookOpen className="h-5 w-5" />}
        label="Bài đã làm"
        value={totalExamsDone}
        sub="bài kiểm tra"
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />
      <StatCard
        icon={<Trophy className="h-5 w-5" />}
        label="Điểm trung bình"
        value={totalExamsDone > 0 ? `${averageScore}` : '—'}
        sub={totalExamsDone > 0 ? 'điểm TOEIC' : 'chưa có dữ liệu'}
        iconBg="bg-warning/10"
        iconColor="text-warning"
      />
      <StatCard
        icon={<BookMarked className="h-5 w-5" />}
        label="Từ vựng"
        value={vocabCount}
        sub="từ đã lưu"
        iconBg="bg-accent/10"
        iconColor="text-accent"
      />
      <StatCard
        icon={<Target className="h-5 w-5" />}
        label="Accuracy TB"
        value={avgAccuracy !== null ? `${avgAccuracy}%` : '—'}
        sub={avgAccuracy !== null ? 'độ chính xác' : 'chưa có dữ liệu'}
        iconBg="bg-success/10"
        iconColor="text-success"
      />
    </div>
  );
}
