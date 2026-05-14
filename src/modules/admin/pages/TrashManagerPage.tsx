
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  RefreshCcw, 
  Trash2, 
  Loader2, 
  FileText, 
  HelpCircle 
} from 'lucide-react';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';

export default function TrashManagerPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'exam' | 'question'>('exam');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[], type: 'exam' | 'question' } | null>(null);

  const { data: trash, isLoading } = useQuery({
    queryKey: ['admin', 'trash'],
    queryFn: () => adminApi.getTrash(),
  });

  const restoreMutation = useMutation({
    mutationFn: (item: { ids: string[], type: 'exam' | 'question' }) => {
      return item.type === 'exam' 
        ? adminApi.bulkRestoreExams(item.ids) 
        : adminApi.bulkRestoreQuestions(item.ids);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'trash'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
      toast.success(res.message || 'Khôi phục thành công');
      setSelectedIds([]);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi khôi phục'),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (item: { ids: string[], type: 'exam' | 'question' }) => {
      return item.type === 'exam' 
        ? adminApi.bulkHardDeleteExams(item.ids) 
        : adminApi.bulkHardDeleteQuestions(item.ids);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'trash'] });
      toast.success(res.message || 'Đã xóa vĩnh viễn');
      setConfirmDelete(null);
      setSelectedIds([]);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi xóa vĩnh viễn'),
  });

  const toggleSelectAll = (items: any[]) => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentItems = activeTab === 'exam' ? (trash?.exams || []) : (trash?.questions || []);

  return (
    <div className="p-6 space-y-6 h-full flex flex-col relative">
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Thùng rác</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý các đề thi và câu hỏi đã xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn chúng.
        </p>
      </div>

      <Tabs 
        defaultValue="exam" 
        className="flex-1 flex flex-col min-h-0" 
        onValueChange={(v) => {
          setActiveTab(v as any);
          setSelectedIds([]);
        }}
      >
        <TabsList className="w-fit mb-4">
          <TabsTrigger value="exam" className="gap-2">
            <FileText className="w-4 h-4" />
            Đề thi ({trash?.exams?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="question" className="gap-2">
            <HelpCircle className="w-4 h-4" />
            Câu hỏi ({trash?.questions?.length || 0})
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden border border-border rounded-xl bg-card shadow-sm relative">
          <TabsContent value="exam" className="h-full m-0">
            <div className="h-full overflow-auto custom-scrollbar">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={trash?.exams?.length > 0 && selectedIds.length === trash?.exams?.length}
                        onCheckedChange={() => toggleSelectAll(trash?.exams)}
                      />
                    </TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Phân loại</TableHead>
                    <TableHead>Ngày xóa</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trash?.exams?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        Thùng rác trống.
                      </TableCell>
                    </TableRow>
                  )}
                  {trash?.exams?.map((e: any) => (
                    <TableRow key={e.id} className={selectedIds.includes(e.id) ? "bg-primary/5" : ""}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.includes(e.id)}
                          onCheckedChange={() => toggleSelectOne(e.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{e.part}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(e.deletedAt).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => restoreMutation.mutate({ ids: [e.id], type: 'exam' })}
                        >
                          <RefreshCcw className="w-4 h-4 mr-2" />
                          Khôi phục
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmDelete({ ids: [e.id], type: 'exam' })}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa vĩnh viễn
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="question" className="h-full m-0">
            <div className="h-full overflow-auto custom-scrollbar">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={trash?.questions?.length > 0 && selectedIds.length === trash?.questions?.length}
                        onCheckedChange={() => toggleSelectAll(trash?.questions)}
                      />
                    </TableHead>
                    <TableHead>Nội dung câu hỏi</TableHead>
                    <TableHead>Thuộc đề</TableHead>
                    <TableHead>Ngày xóa</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trash?.questions?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        Thùng rác trống.
                      </TableCell>
                    </TableRow>
                  )}
                  {trash?.questions?.map((q: any) => (
                    <TableRow key={q.id} className={selectedIds.includes(q.id) ? "bg-primary/5" : ""}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.includes(q.id)}
                          onCheckedChange={() => toggleSelectOne(q.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-md truncate">
                        {q.questionText}
                      </TableCell>
                      <TableCell className="text-sm italic">
                        {q.examTitle}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(q.deletedAt).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => restoreMutation.mutate({ ids: [q.id], type: 'question' })}
                        >
                          <RefreshCcw className="w-4 h-4 mr-2" />
                          Khôi phục
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmDelete({ ids: [q.id], type: 'question' })}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa vĩnh viễn
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Floating Bulk Actions Bar (Internal to Table container) */}
          {selectedIds.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <span className="text-sm font-bold border-r border-background/20 pr-6">
                Đã chọn {selectedIds.length} mục
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-background hover:bg-background/10 hover:text-background"
                  onClick={() => setSelectedIds([])}
                >
                  Hủy
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="h-8 font-bold gap-2"
                  onClick={() => restoreMutation.mutate({ ids: selectedIds, type: activeTab })}
                  disabled={restoreMutation.isPending}
                >
                  <RefreshCcw className="w-4 h-4" />
                  Khôi phục
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-8 font-bold gap-2"
                  onClick={() => setConfirmDelete({ ids: selectedIds, type: activeTab })}
                  disabled={hardDeleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa vĩnh viễn
                </Button>
              </div>
            </div>
          )}
        </div>
      </Tabs>

      <DeleteConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={() => confirmDelete && hardDeleteMutation.mutate(confirmDelete)}
        isLoading={hardDeleteMutation.isPending}
        title="Xác nhận xóa vĩnh viễn?"
        description={`Hành động này sẽ xóa vĩnh viễn ${confirmDelete?.ids.length} mục đã chọn và tất cả dữ liệu liên quan (kết quả thi, câu hỏi...). Không thể hoàn tác.`}
      />
    </div>
  );
}
