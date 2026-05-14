
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';
import { ExamTable } from './ExamTable';
import { ExamFormDialog } from './ExamFormDialog';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { AdminExamItem, ExamCreateBody } from '@/types/admin';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';

export function ExamManagementContainer() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<AdminExamItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingExam, setDeletingExam] = useState<AdminExamItem | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Fetch exams
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'exams'],
    queryFn: () => adminApi.getExams(),
  });

  // Create/Update mutation
  const { mutateAsync: saveMutation, isPending: isSaving } = useMutation({
    mutationFn: async (body: ExamCreateBody) => {
      if (selectedExam) {
        return adminApi.updateExam({ id: selectedExam.id, body });
      }
      return adminApi.createExam(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] });
      toast.success(selectedExam ? 'Cập nhật đề thi thành công' : 'Tạo đề thi mới thành công');
      setIsDialogOpen(false);
      setSelectedExam(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Đã có lỗi xảy ra');
    },
  });

  // Toggle Publish Status
  const { mutate: togglePublish } = useMutation({
    mutationFn: async (exam: AdminExamItem) => {
      return adminApi.updateExam({ 
        id: exam.id, 
        body: { isPublished: !exam.isPublished } 
      });
    },
    onSuccess: (_, exam) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] });
      toast.success(exam.isPublished ? 'Đã gỡ bài thi' : 'Đã công khai bài thi');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Đã có lỗi xảy ra');
    },
  });

  // Delete Mutation (Soft Delete)
  const { mutate: deleteExam } = useMutation({
    mutationFn: (id: string) => adminApi.deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'trash'] });
      toast.success('Đã chuyển đề thi vào thùng rác');
      setDeletingExam(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Đã có lỗi xảy ra');
      setDeletingExam(null);
    },
  });

  const handleEdit = (exam: AdminExamItem) => {
    setSelectedExam(exam);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedExam(null);
    setIsDialogOpen(true);
  };

  // Bulk Delete
  const { mutate: bulkDelete } = useMutation({
    mutationFn: (ids: string[]) => adminApi.bulkDeleteExams(ids),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'trash'] });
      toast.success(res.message || 'Đã xóa hàng loạt');
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi xóa hàng loạt');
      setIsBulkDeleteOpen(false);
    },
  });

  const filteredExams = data?.exams.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm đề thi..."
            className="pl-9 h-10 hover:border-primary/50 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
          <Button onClick={handleAdd} className="h-10 gap-2 w-full sm:w-auto shadow-md hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            Thêm đề thi
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <ExamTable
          exams={filteredExams}
          isLoading={isLoading}
          onEdit={handleEdit}
          onToggleStatus={(e) => togglePublish(e)}
          onDelete={(e) => setDeletingExam(e)}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

        {/* Floating Bulk Actions Bar */}
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
                variant="destructive" 
                size="sm" 
                className="h-8 font-bold"
                onClick={() => setIsBulkDeleteOpen(true)}
              >
                Xóa tất cả
              </Button>
            </div>
          </div>
        )}
      </div>

      <ExamFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={saveMutation}
        initialData={selectedExam}
        isPending={isSaving}
        allExams={data?.exams || []}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingExam}
        onOpenChange={(open) => !open && setDeletingExam(null)}
        onConfirm={() => deletingExam && deleteExam(deletingExam.id)}
        isLoading={false}
        title="Xóa đề thi?"
        description={`Bạn có chắc muốn chuyển đề thi "${deletingExam?.title}" vào thùng rác?`}
      />

      {/* Bulk Delete Confirmation */}
      <DeleteConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        onConfirm={() => bulkDelete(selectedIds)}
        isLoading={false}
        title="Xóa hàng loạt?"
        description={`Bạn có chắc muốn chuyển ${selectedIds.length} đề thi đã chọn vào thùng rác?`}
      />
    </div>
  );
}
