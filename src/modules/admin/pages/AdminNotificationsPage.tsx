import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, Send, Users, Trash2, Calendar, History as HistoryIcon } from 'lucide-react';
import { toRelativeTime } from '@/utils/relativeTime';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';

const broadcastSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  body: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
  targetRole: z.enum(['ALL', 'STANDARD', 'VIP']),
});

type BroadcastFormValues = z.infer<typeof broadcastSchema>;

export default function AdminNotificationsPage() {
  const [loading, setLoading] = React.useState(false);
  const [deletingBroadcastId, setDeletingBroadcastId] = React.useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      title: '',
      body: '',
      targetRole: 'ALL',
    },
  });

  // Lấy lịch sử đợt gửi
  const { data, isLoading: historyLoading } = useQuery({
    queryKey: ['admin', 'broadcasts'],
    queryFn: adminApi.getBroadcasts,
  });

  // Mutation xóa đợt gửi
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteBroadcast,
    onSuccess: () => {
      toast.success('Đã xóa đợt thông báo thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'broadcasts'] });
      setDeletingBroadcastId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa đợt thông báo');
      setDeletingBroadcastId(null);
    },
  });

  const onSubmit = async (values: BroadcastFormValues) => {
    try {
      setLoading(true);
      const result = await adminApi.broadcastNotification(values);
      toast.success(`Đã gửi thông báo thành công đến ${result.sent} người dùng.`);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['admin', 'broadcasts'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi thông báo.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ALL': return <Badge variant="secondary">Tất cả</Badge>;
      case 'STANDARD': return <Badge variant="outline">Standard</Badge>;
      case 'VIP': return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">VIP</Badge>;
      default: return role;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Bell className="h-8 w-8 text-primary" />
          Quản lý thông báo hệ thống
        </h1>
        <p className="text-muted-foreground">
          Gửi thông báo realtime và quản lý lịch sử các đợt phát tin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form bên trái */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Gửi thông báo mới</CardTitle>
              <CardDescription>
                Thông báo sẽ được đẩy ngay lập tức qua Socket.io.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="targetRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4" /> Đối tượng nhận
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Chọn đối tượng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ALL">Tất cả người dùng</SelectItem>
                            <SelectItem value="STANDARD">Người dùng Standard</SelectItem>
                            <SelectItem value="VIP">Người dùng VIP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiêu đề</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nhập tiêu đề..." 
                            className="bg-background/50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <RichTextEditor
                        label="Nội dung"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Nội dung chi tiết..."
                        error={form.formState.errors.body?.message}
                        minHeight="150px"
                      />
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                  >
                    {loading ? 'Đang gửi...' : <><Send className="mr-2 h-5 w-5" /> Gửi thông báo</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Lịch sử bên phải */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <HistoryIcon className="h-5 w-5 text-primary" />
                  Lịch sử đã gửi
                </CardTitle>
                <CardDescription>Các đợt thông báo đã phát gần đây.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Đang tải lịch sử...</p>
                </div>
              ) : data?.broadcasts?.length > 0 ? (
                <div className="rounded-md border border-border/50">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[40%] text-xs font-bold uppercase">Thông báo</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Đối tượng</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Thời gian</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.broadcasts.map((b: any) => (
                        <TableRow key={b.id} className="hover:bg-muted/30 transition-colors group">
                          <TableCell className="py-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-sm line-clamp-1">{b.title}</span>
                              <span className="text-xs text-muted-foreground line-clamp-2">{b.body}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getRoleBadge(b.targetRole)}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                            <div className="flex flex-col">
                              <span>{toRelativeTime(b.sentAt)}</span>
                              <span className="text-[10px] opacity-60 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {new Date(b.sentAt).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setDeletingBroadcastId(b.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                  <HistoryIcon className="h-10 w-10 text-muted-foreground/20" />
                  <p className="text-muted-foreground text-sm">Chưa có lịch sử gửi thông báo nào.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <DeleteConfirmDialog
        open={!!deletingBroadcastId}
        onOpenChange={(open) => !open && setDeletingBroadcastId(null)}
        onConfirm={() => deletingBroadcastId && deleteMutation.mutate(deletingBroadcastId)}
        isLoading={deleteMutation.isPending}
        title="Xóa đợt thông báo?"
        description="Hành động này sẽ xóa thông báo khỏi hộp thư của tất cả người dùng liên quan. Bạn không thể hoàn tác."
      />
    </div>
  );
}
