import { Crown, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function VIPUpgradeOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
      <Card className="w-full max-w-sm p-8 flex flex-col items-center text-center shadow-xl border-primary/20 bg-card">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Crown className="h-6 w-6 text-primary" />
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-2">Tính năng VIP</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Phân tích điểm yếu theo từng chủ đề ngữ pháp để tối ưu lộ trình học.
        </p>
        
        <ul className="space-y-3 mb-8 w-full text-left text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            <span className="text-foreground">Biểu đồ chi tiết theo chủ đề</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            <span className="text-foreground">Gợi ý cải thiện điểm yếu</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            <span className="text-foreground">Truy cập tất cả đề thi VIP</span>
          </li>
        </ul>
        
        <Button className="w-full font-semibold group">
          Nâng cấp VIP ngay
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Card>
    </div>
  );
}
