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
import { PART_COLORS, type ProgressData, type ChartDataPoint } from '@/types/analytics';

interface AccuracyLineChartProps {
  progress: ProgressData;
}

function formatWeekLabel(isoDate: string) {
  // Format MM/DD
  const date = new Date(isoDate);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function AccuracyLineChart({ progress }: AccuracyLineChartProps) {
  const data = progress.weekly;
  const hasData = data.length > 0;

  // Xây dựng data tương thích Recharts
  const chartData: ChartDataPoint[] = data.map((w) => ({
    weekStart: w.weekStart,
    PART5: w.accuracyByPart.PART5,
    PART6: w.accuracyByPart.PART6,
    PART7: w.accuracyByPart.PART7,
  }));

  // Điều kiện < 3 tuần có làm bài thi
  const weeksWithExams = data.filter((w) => w.examCount > 0).length;
  const showNotice = weeksWithExams < 3;

  if (!hasData) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-1">Độ chính xác theo tuần</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Biểu đồ thể hiện độ chính xác (%) theo từng Part. Các tuần không luyện tập sẽ không được nối liền.
      </p>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: -20 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="weekStart"
              tickFormatter={formatWeekLabel}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`]}
              labelFormatter={(label) => `Tuần: ${formatWeekLabel(label as string)}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
            />
            <Line
              name="Part 5"
              type="monotone"
              dataKey="PART5"
              stroke={PART_COLORS.PART5}
              strokeWidth={2.5}
              dot={{ r: 4, fill: PART_COLORS.PART5 }}
              activeDot={{ r: 6 }}
              connectNulls={false} // Quan trọng: đứt đoạn nếu null
            />
            <Line
              name="Part 6"
              type="monotone"
              dataKey="PART6"
              stroke={PART_COLORS.PART6}
              strokeWidth={2.5}
              dot={{ r: 4, fill: PART_COLORS.PART6 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
            <Line
              name="Part 7"
              type="monotone"
              dataKey="PART7"
              stroke={PART_COLORS.PART7}
              strokeWidth={2.5}
              dot={{ r: 4, fill: PART_COLORS.PART7 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {showNotice && (
        <p className="text-xs text-center text-muted-foreground mt-4 italic">
          Tiếp tục luyện tập để xem đồ thị đầy đủ 📈
        </p>
      )}
    </div>
  );
}
