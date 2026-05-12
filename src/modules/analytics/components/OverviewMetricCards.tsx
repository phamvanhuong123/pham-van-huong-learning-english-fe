import { Card, CardContent } from '@/components/ui/card';
import type { OverviewData } from '@/types/analytics';

interface OverviewMetricCardsProps {
  overview: OverviewData;
}

export function OverviewMetricCards({ overview }: OverviewMetricCardsProps) {
  const { totalExams, totalQuestions, totalVocab, overallAccuracy } = overview;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Bài đã làm</p>
          <p className="text-3xl font-bold text-foreground">{totalExams}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Câu đã làm</p>
          <p className="text-3xl font-bold text-foreground">{totalQuestions}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Từ vựng</p>
          <p className="text-3xl font-bold text-accent">{totalVocab}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Accuracy</p>
          <p className="text-3xl font-bold text-primary">
            {overallAccuracy !== null ? `${overallAccuracy}%` : '--'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
