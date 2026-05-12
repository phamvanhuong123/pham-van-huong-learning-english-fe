import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Upload, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/services/adminApi';
import { QuestionTable } from './QuestionTable';
import { QuestionFormDialog } from './QuestionFormDialog';
import { ImportJSONDialog } from './ImportJSONDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { QuestionCreateBody } from '@/types/admin';

export function QuestionBankContainer() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Filters
  const [examId, setExamId] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const queryParams = {
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(examId !== 'ALL' && { examId }),
    ...(difficulty !== 'ALL' && { difficulty }),
    ...(status !== 'ALL' && { status }),
  };

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['admin', 'questions', queryParams],
    queryFn: () => adminApi.getQuestions(queryParams),
    staleTime: 60 * 1000,
  });

  const { data: examsData } = useQuery({
    queryKey: ['admin', 'exams-list'],
    queryFn: adminApi.getExams,
    staleTime: 5 * 60 * 1000,
  });

  const examsList = examsData?.exams || examsData || [];

  const saveMutation = useMutation({
    mutationFn: async (data: QuestionCreateBody) => {
      if (editingQuestion) {
        return adminApi.updateQuestion({ id: editingQuestion.id, body: data });
      }
      return adminApi.createQuestion(data);
    },
    onSuccess: () => {
      toast.success(editingQuestion ? 'Cập nhật thành công' : 'Tạo mới thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
      setIsFormOpen(false);
      setEditingQuestion(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteQuestion(id),
    onSuccess: () => {
      toast.success('Đã xóa câu hỏi');
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
      setDeletingQuestion(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể xóa câu hỏi này vì đã có dữ liệu thi');
      setDeletingQuestion(null);
    },
  });

  const importMutation = useMutation({
    mutationFn: async (items: QuestionCreateBody[]) => {
      // Vì API không có bulkCreate, ta gọi loop hoặc giả sử backend support 
      // Nhưng an toàn nhất là Promise.all nếu số lượng nhỏ. 
      // Ở đây ta gọi createQuestion trong loop.
      let success = 0;
      let fail = 0;
      for (const item of items) {
        try {
          await adminApi.createQuestion(item);
          success++;
        } catch (e) {
          fail++;
        }
      }
      return { success, fail };
    },
    onSuccess: (res) => {
      toast.success(`Đã import thành công ${res.success} câu hỏi. Lỗi ${res.fail} câu.`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra trong quá trình import');
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border">
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo nội dung..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <Select value={examId} onValueChange={(v) => { setExamId(v); setPage(1); }}>
            <SelectTrigger className="w-[140px] lg:w-[200px]">
              <SelectValue placeholder="Chọn đề thi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả đề thi</SelectItem>
              {examsList.map((ex: any) => (
                <SelectItem key={ex.id} value={ex.id}>{ex.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={(v) => { setDifficulty(v); setPage(1); }}>
            <SelectTrigger className="w-[110px] hidden lg:flex">
              <SelectValue placeholder="Độ khó" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả độ khó</SelectItem>
              <SelectItem value="EASY">Dễ</SelectItem>
              <SelectItem value="MEDIUM">Trung bình</SelectItem>
              <SelectItem value="HARD">Khó</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" /> Import JSON
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setEditingQuestion(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Tạo câu hỏi
          </Button>
        </div>
      </div>

      <QuestionTable
        questions={questionsData?.questions || questionsData?.data || []}
        isLoading={isLoading}
        onEdit={(q) => {
          setEditingQuestion(q);
          setIsFormOpen(true);
        }}
        onDelete={(q) => setDeletingQuestion(q)}
      />

      {/* Pagination */}
      {questionsData?.pagination && questionsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Hiển thị <span className="font-medium">{questionsData.questions?.length || questionsData.data?.length}</span> trên tổng số{' '}
            <span className="font-medium">{questionsData.pagination.total}</span> câu
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Trang trước</Button>
            <span className="text-sm px-4">{page} / {questionsData.pagination.totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(questionsData.pagination.totalPages, p + 1))} disabled={page === questionsData.pagination.totalPages}>Trang sau</Button>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      {isFormOpen && (
        <QuestionFormDialog
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingQuestion(null);
          }}
          onSave={async (data) => {
            await saveMutation.mutateAsync(data);
          }}
          initialData={editingQuestion}
          exams={examsList}
          isPending={saveMutation.isPending}
        />
      )}

      {/* Import Dialog */}
      <ImportJSONDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={async (items) => {
          await importMutation.mutateAsync(items);
        }}
        isPending={importMutation.isPending}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingQuestion} onOpenChange={(open) => !open && setDeletingQuestion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa câu hỏi này không? Nếu câu hỏi đã được người dùng làm bài, hệ thống sẽ chặn hành động xóa để đảm bảo toàn vẹn dữ liệu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate(deletingQuestion.id);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa ngay'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
