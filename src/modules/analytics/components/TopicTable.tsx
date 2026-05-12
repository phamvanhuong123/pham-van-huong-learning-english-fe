import { getEvaluationLevel, type TopicStat } from '@/types/analytics';
import { cn } from '@/lib/utils';

interface TopicTableProps {
  topics: TopicStat[];
}

export function TopicTable({ topics }: TopicTableProps) {
  if (topics.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-6 py-3 whitespace-nowrap">Chủ đề</th>
              <th className="px-6 py-3 whitespace-nowrap text-right">Tổng câu</th>
              <th className="px-6 py-3 whitespace-nowrap text-right">Đúng</th>
              <th className="px-6 py-3 whitespace-nowrap text-right">Accuracy</th>
              <th className="px-6 py-3 whitespace-nowrap text-center">Đánh giá</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {topics.map((t) => {
              const evalLevel = getEvaluationLevel(t.accuracy);
              
              return (
                <tr key={t.topic} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-foreground">{t.topic}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground">{t.totalQ}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground">{t.correctQ}</td>
                  <td className="px-6 py-3 text-right font-medium text-foreground">{t.accuracy}%</td>
                  <td className="px-6 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium',
                        evalLevel === 'weak' && 'bg-destructive/10 text-destructive',
                        evalLevel === 'average' && 'bg-warning/10 text-warning',
                        evalLevel === 'good' && 'bg-success/10 text-success'
                      )}
                    >
                      {evalLevel === 'weak' && 'Cần cải thiện'}
                      {evalLevel === 'average' && 'Trung bình'}
                      {evalLevel === 'good' && 'Tốt'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
