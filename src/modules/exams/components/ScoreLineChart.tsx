import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { ExamResult } from '../types';

// Màu chart đúng theo design-system.md
const PART_COLORS = {
  PART5: '#2563EB',
  PART6: '#0D9488',
  PART7: '#F59E0B',
} as const;

interface ChartDataPoint {
  date: string;
  PART5?: number;
  PART6?: number;
  PART7?: number;
}

interface ScoreLineChartProps {
  results: ExamResult[];
}

function buildChartData(results: ExamResult[]): ChartDataPoint[] {
  // Group by date (YYYY-MM-DD), take latest score per part per day
  const map = new Map<string, ChartDataPoint>();

  const sorted = [...results].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
  );

  for (const r of sorted) {
    if (r.part === 'FULL') continue; // FULL không hiển thị trên line chart theo part
    const date = new Date(r.submittedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const existing = map.get(date) ?? { date };
    existing[r.part as keyof typeof PART_COLORS] = r.score;
    map.set(date, existing);
  }

  return Array.from(map.values());
}

export function ScoreLineChart({ results }: ScoreLineChartProps) {
  const chartData = buildChartData(results);
  const hasData = chartData.length > 0;

  if (!hasData) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-1">Tiến độ điểm số</h2>
      <p className="text-sm text-muted-foreground mb-6">Điểm số theo thời gian, phân loại theo Part</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 990]}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="PART5"
            stroke={PART_COLORS.PART5}
            strokeWidth={2.5}
            dot={{ r: 4, fill: PART_COLORS.PART5 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="PART6"
            stroke={PART_COLORS.PART6}
            strokeWidth={2.5}
            dot={{ r: 4, fill: PART_COLORS.PART6 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="PART7"
            stroke={PART_COLORS.PART7}
            strokeWidth={2.5}
            dot={{ r: 4, fill: PART_COLORS.PART7 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
