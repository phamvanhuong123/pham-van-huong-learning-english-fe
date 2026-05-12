
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

export function ExamManagementContainer() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<AdminExamItem | null>(null);

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

  const handleEdit = (exam: AdminExamItem) => {
    setSelectedExam(exam);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedExam(null);
    setIsDialogOpen(true);
  };

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

      <div className="flex-1 min-h-0">
        <ExamTable
          exams={filteredExams}
          isLoading={isLoading}
          onEdit={handleEdit}
          onToggleStatus={(e) => togglePublish(e)}
        />
      </div>

      <ExamFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={saveMutation}
        initialData={selectedExam}
        isPending={isSaving}
        allExams={data?.exams || []}
      />
    </div>
  );
}
