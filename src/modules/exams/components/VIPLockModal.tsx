import { useQuery } from '@tanstack/react-query';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { fetchExamPreview } from '@/services/examLibraryApi';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@radix-ui/react-dialog';

interface VIPLockModalProps {
  examId: string | null;
  onClose: () => void;
}

export function VIPLockModal({ examId, onClose }: VIPLockModalProps) {
  const navigate = useNavigate();
  const isOpen = examId !== null;

  const { data, isLoading } = useQuery({
    queryKey: ['exam-preview', examId],
    queryFn: () => fetchExamPreview(examId!),
    enabled: isOpen && examId !== null,
    staleTime: 5 * 60 * 1000,
  });

  const previewQuestions = data?.previewQuestions ?? [];
  const remainingCount = (data?.totalQuestions ?? 0) - previewQuestions.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Lock className="w-5 h-5 text-primary" />
            Đề thi Premium
            <Crown className="w-4 h-4 text-warning" />
          </DialogTitle>
        </DialogHeader>

        {/* Preview Section */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Xem trước nội dung
          </p>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-4/5 rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : (
            <div className="relative">
              <div className="flex flex-col gap-2">
                {previewQuestions.slice(0, 3).map((q, i) => (
                  <div
                    key={i}
                    className="text-sm text-foreground bg-muted/50 rounded-lg px-4 py-2.5 border border-border leading-relaxed line-clamp-2"
                  >
                    <span className="text-muted-foreground font-mono text-xs mr-2">{i + 1}.</span>
                    {q}
                  </div>
                ))}
                {previewQuestions.length === 0 && (
                  <>
                    {['The report was submitted ___...', 'Despite the heavy rain, the team...', 'The manager asked all employees...'].map((q, i) => (
                      <div key={i} className="text-sm text-foreground bg-muted/50 rounded-lg px-4 py-2.5 border border-border leading-relaxed line-clamp-2">
                        <span className="text-muted-foreground font-mono text-xs mr-2">{i + 1}.</span>
                        {q}
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Gradient mask + "... và N câu nữa" */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-popover to-transparent rounded-b-lg pointer-events-none" />
              <p className="text-xs text-muted-foreground text-center mt-2 italic">
                ... và {remainingCount > 0 ? remainingCount : '...'} câu nữa
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Nâng cấp VIP để truy cập toàn bộ</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Mở khóa tất cả đề thi, xuất PDF báo cáo và phân tích chi tiết tiến độ học tập.
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button id="vip-modal-close" variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </DialogClose>
          <Button
            id="vip-modal-upgrade"
            variant="default"
            className="gap-2"
            onClick={() => {
              onClose();
              navigate('/dashboard/profile?tab=billing');
            }}
          >
            <Crown className="w-4 h-4" /> Nâng cấp VIP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
