import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { 
  Crown, 
  Check, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  MessageSquare, 
  Upload,
  ArrowRight,
  Loader2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { subscriptionApi } from '@/services/subscriptionApi';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: '1m',
    name: '1 Tháng',
    price: '99.000',
    originalPrice: '149.000',
    savings: '33%',
    features: [
      'Làm đề Premium không giới hạn',
      'Lưu từ vựng không giới hạn',
      'Phân tích lỗi chi tiết theo chủ đề',
      'Hỗ trợ giải đáp 24/7',
      'Không quảng cáo'
    ],
    popular: false
  },
  {
    id: '3m',
    name: '3 Tháng',
    price: '249.000',
    originalPrice: '447.000',
    savings: '44%',
    features: [
      'Tất cả tính năng của gói 1 tháng',
      'Tài liệu ôn thi TOEIC độc quyền',
      'Lộ trình học cá nhân hóa',
      'Truy cập sớm các đề thi mới',
      'Ưu tiên hỗ trợ kỹ thuật'
    ],
    popular: true
  },
  {
    id: '12m',
    name: '12 Tháng',
    price: '799.000',
    originalPrice: '1.788.000',
    savings: '55%',
    features: [
      'Tất cả tính năng của gói 3 tháng',
      'Tiết kiệm tối đa chi phí',
      'Gia hạn ưu đãi trọn đời',
      'Tặng ebook 1000 câu hỏi hay sai',
      'Chứng nhận hoàn thành khóa học'
    ],
    popular: false
  }
];

export default function PricingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: pendingRequest, isLoading: isLoadingPending } = useQuery({
    queryKey: ['subscription', 'pending'],
    queryFn: subscriptionApi.getPendingStatus,
  });

  const upgradeMutation = useMutation({
    mutationFn: ({ planId, file }: { planId: string; file: File }) => 
      subscriptionApi.createRequest(planId, file),
    onSuccess: () => {
      toast.success('Yêu cầu đã được gửi! Vui lòng đợi quản trị viên duyệt.');
      setIsUpgradeModalOpen(false);
      setProofFile(null);
      setPreviewUrl(null);
      queryClient.invalidateQueries({ queryKey: ['subscription', 'pending'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ảnh quá lớn (tối đa 5MB)');
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpgrade = (plan: typeof PLANS[0]) => {
    if (pendingRequest) {
      toast.error('Bạn đang có một yêu cầu chờ duyệt!');
      return;
    }
    setSelectedPlan(plan);
    setIsUpgradeModalOpen(true);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedPlan || !proofFile) return;
    upgradeMutation.mutate({ planId: selectedPlan.id, file: proofFile });
  };

  if (isLoadingPending) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      {/* Header Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary text-sm font-medium rounded-full mb-2">
          Gói hội viên VIP
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Nâng cấp tài khoản, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
            Chinh phục TOEIC dễ dàng
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Chọn gói phù hợp với mục tiêu của bạn. <br className="hidden sm:block" /> 
          Cam kết chất lượng, hỗ trợ tận tình suốt quá trình ôn luyện.
        </p>
      </div>

      {pendingRequest && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h3 className="font-bold text-amber-900 dark:text-amber-100 text-lg">Đang chờ quản trị viên duyệt</h3>
              <p className="text-amber-800/80 dark:text-amber-200/80 text-sm leading-relaxed">
                Bạn đã gửi yêu cầu nâng cấp gói <b>{PLANS.find(p => p.id === pendingRequest.plan)?.name}</b> vào lúc {new Date(pendingRequest.createdAt).toLocaleString('vi-VN')}. 
                Yêu cầu thường được duyệt trong vòng 1-2 giờ làm việc.
              </p>
            </div>
            <Button variant="outline" className="bg-white dark:bg-background border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-900 dark:text-amber-100 font-semibold h-11 px-6 rounded-xl">
              Xem chi tiết
            </Button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div 
            key={plan.id}
            className={cn(
              "relative flex flex-col p-8 rounded-3xl border transition-all duration-300 hover:translate-y-[-8px]",
              plan.popular 
                ? "border-primary bg-primary/[0.02] shadow-2xl shadow-primary/10 ring-1 ring-primary/20 scale-105 z-10" 
                : "border-border bg-card hover:border-primary/30 hover:shadow-xl"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Badge className="px-4 py-1.5 bg-primary text-primary-foreground font-bold shadow-lg rounded-full">
                  PHỔ BIẾN NHẤT
                </Badge>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-black text-foreground">{plan.price}đ</span>
                <span className="text-muted-foreground line-through text-sm">{plan.originalPrice}đ</span>
              </div>
              <Badge variant="outline" className="text-success border-success/30 bg-success/5 font-semibold">
                Tiết kiệm {plan.savings}
              </Badge>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-foreground/80 leading-snug">{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              className={cn(
                "w-full h-14 text-lg font-bold rounded-2xl group transition-all",
                plan.popular ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-primary hover:text-white"
              )}
              onClick={() => handleUpgrade(plan)}
              disabled={!!pendingRequest}
            >
              Chọn gói này
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        ))}
      </div>

      {/* Trust Section */}
      <div className="pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <ShieldCheck className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Thanh toán bảo mật</h4>
            <p className="text-xs text-muted-foreground">Xác nhận bằng ảnh biên lai</p>
          </div>
        </div>
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Zap className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Kích hoạt nhanh</h4>
            <p className="text-xs text-muted-foreground">Trong vòng 15-30 phút</p>
          </div>
        </div>
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <BarChart3 className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Học liệu chất lượng</h4>
            <p className="text-xs text-muted-foreground">Nội dung cập nhật liên tục</p>
          </div>
        </div>
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <MessageSquare className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Hỗ trợ tận tâm</h4>
            <p className="text-xs text-muted-foreground">Luôn đồng hành cùng bạn</p>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none bg-background shadow-2xl">
          <div className="bg-gradient-to-br from-primary to-primary/70 p-8 text-white relative overflow-hidden">
             <div className="relative z-10">
               <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-3 px-3 py-1 font-bold">THANH TOÁN</Badge>
               <h3 className="text-3xl font-black mb-1">Xác nhận gói {selectedPlan?.name}</h3>
               <p className="text-primary-foreground/90 font-medium">Bạn sắp trở thành hội viên VIP của TOEIC Master</p>
             </div>
             <Crown className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-12" />
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Payment Instructions */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">1</span>
                    Chuyển khoản ngân hàng
                  </h4>
                  <div className="bg-muted/50 rounded-2xl p-5 border border-border space-y-3 shadow-inner">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Ngân hàng</span>
                      <span className="font-bold">Vietcombank</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Số tài khoản</span>
                      <span className="font-bold text-primary tracking-wider">1234567890</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Chủ tài khoản</span>
                      <span className="font-bold uppercase">NGUYEN VAN A</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Số tiền</span>
                      <span className="font-bold text-lg text-primary">{selectedPlan?.price}đ</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">2</span>
                    Nội dung chuyển khoản
                  </h4>
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                    <code className="text-primary font-black text-lg select-all">VIP {selectedPlan?.id.toUpperCase()} USER_ID</code>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium italic">Click để sao chép nội dung</p>
                  </div>
                </div>
              </div>

              {/* Upload Proof */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">3</span>
                    Tải lên biên lai
                  </h4>
                  
                  <div className="relative group">
                    <input
                      type="file"
                      id="proof-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="proof-upload"
                      className={cn(
                        "flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden relative",
                        previewUrl 
                          ? "border-primary" 
                          : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/[0.01]"
                      )}
                    >
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} alt="Proof" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" size="sm" className="font-bold">Thay đổi ảnh</Button>
                          </div>
                        </>
                      ) : (
                        <div className="p-6 text-center space-y-3">
                          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-sm">Tải ảnh lên</p>
                            <p className="text-[10px] text-muted-foreground max-w-[120px]">Chụp màn hình giao dịch chuyển khoản</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
               <div className="bg-muted/30 p-4 rounded-xl mb-6">
                 <p className="text-[11px] text-muted-foreground leading-relaxed">
                   <b>Lưu ý:</b> Vui lòng chuyển khoản đúng số tiền và nội dung. Sau khi tải ảnh lên, quản trị viên sẽ kiểm tra và kích hoạt gói VIP cho bạn trong thời gian sớm nhất. Mọi thắc mắc vui lòng liên hệ hotline 0123 456 789.
                 </p>
               </div>

               <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 font-bold rounded-xl border-border"
                    onClick={() => setIsUpgradeModalOpen(false)}
                    disabled={upgradeMutation.isPending}
                  >
                    Hủy bỏ
                  </Button>
                  <Button 
                    className="flex-[2] h-12 font-bold rounded-xl shadow-lg shadow-primary/20"
                    disabled={!proofFile || upgradeMutation.isPending}
                    onClick={handleConfirmUpgrade}
                  >
                    {upgradeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang gửi yêu cầu...
                      </>
                    ) : (
                      'Gửi bằng chứng & Nâng cấp'
                    )}
                  </Button>
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
