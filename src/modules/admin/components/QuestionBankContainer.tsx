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
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import type { QuestionCreateBody } from '@/types/admin';

export function QuestionBankContainer() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Filters
  const [examId, setExamId] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

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

  // Truyền thêm `part` để QuestionFormDialog biết ẩn/hiện passage
  const examsList = (Array.isArray(examsData) ? examsData : (examsData?.exams || [])).map(
    (e: any) => ({ id: e.id, title: e.title, part: e.part }),
  );

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
      // Việc đóng form do onSave callback trong JSX quyết định (hỗ trợ isContinue)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteQuestion(id),
    onSuccess: () => {
      toast.success('Đã chuyển câu hỏi vào thùng rác');
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'trash'] });
      setDeletingQuestion(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể xóa câu hỏi này vì đã có dữ liệu thi');
      setDeletingQuestion(null);
    },
  });

  const { mutate: bulkDelete } = useMutation({
    mutationFn: (ids: string[]) => adminApi.bulkDeleteQuestions(ids),
    onSuccess: (res: any) => {
      toast.success(res.message || 'Đã xóa hàng loạt');
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'trash'] });
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi xóa hàng loạt');
      setIsBulkDeleteOpen(false);
    },
  });

  const importMutation = useMutation({
    mutationFn: async (items: QuestionCreateBody[]) => {
      let success = 0;
      let fail = 0;
      let errorMessages: string[] = [];

      for (const [index, item] of items.entries()) {
        try {
          await adminApi.createQuestion(item);
          success++;
        } catch (e: any) {
          fail++;
          const msg = e.response?.data?.message || e.message || 'Lỗi không xác định';
          errorMessages.push(`Câu ${index + 1}: ${msg}`);
        }
      }
      return { success, fail, errorMessages };
    },
    onSuccess: (res) => {
      if (res.fail > 0) {
        toast.error(`Import hoàn tất: ${res.success} thành công, ${res.fail} thất bại.`, {
          description: (
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1 text-[11px]">
              {res.errorMessages.map((m, i) => <p key={i} className="text-destructive">• {m}</p>)}
            </div>
          ),
          duration: 10000,
        });
      } else {
        toast.success(`Đã import thành công tất cả ${res.success} câu hỏi.`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
    onError: () => {
      toast.error('Lỗi nghiêm trọng trong quá trình import');
    }
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      {/* Top Bar Actions */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border">
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

      <div className="flex-1 min-h-0 relative">
        <QuestionTable
          questions={questionsData?.questions || questionsData?.data || []}
          isLoading={isLoading}
          onEdit={(q) => {
            setEditingQuestion(q);
            setIsFormOpen(true);
          }}
          onDelete={(q) => setDeletingQuestion(q)}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

        {/* Floating Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <span className="text-sm font-bold border-r border-background/20 pr-6">
              Đã chọn {selectedIds.length} câu
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

      {/* Pagination & Limit Selector */}
      <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Hiển thị <span className="font-medium">{questionsData?.questions?.length || questionsData?.data?.length || 0}</span> trên tổng số{' '}
            <span className="font-medium">{questionsData?.pagination?.total || 0}</span> câu
          </p>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Số hàng:</span>
            <Select value={limit.toString()} onValueChange={(v) => { setLimit(parseInt(v)); setPage(1); }}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map(v => (
                  <SelectItem key={v} value={v.toString()}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {questionsData?.pagination && questionsData.pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Trang trước</Button>
            <span className="text-sm px-4 font-medium">{page} / {questionsData.pagination.totalPages}</span>
            <Button variant="outline" size="sm" className="h-8" onClick={() => setPage(p => Math.min(questionsData.pagination.totalPages, p + 1))} disabled={page === questionsData.pagination.totalPages}>Trang sau</Button>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      {isFormOpen && (
        <QuestionFormDialog
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingQuestion(null);
          }}
        onSave={async (data, isContinue) => {
            await saveMutation.mutateAsync(data);
            // Khi "Lưu & Tiếp tục", form tự reset bên trong nên không cần đóng
            if (!isContinue) {
              setIsFormOpen(false);
              setEditingQuestion(null);
            } else {
              // Chỉ reset editing (câu mới không phải edit cũ)
              setEditingQuestion(null);
            }
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
      <DeleteConfirmDialog
        open={!!deletingQuestion}
        onOpenChange={(open) => !open && setDeletingQuestion(null)}
        onConfirm={() => deletingQuestion && deleteMutation.mutate(deletingQuestion.id)}
        isLoading={deleteMutation.isPending}
        title="Xác nhận xóa câu hỏi?"
        description="Câu hỏi sẽ được chuyển vào Thùng rác. Bạn có thể khôi phục lại sau này nếu cần."
      />

      {/* Bulk Delete Confirmation */}
      <DeleteConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        onConfirm={() => bulkDelete(selectedIds)}
        isLoading={false}
        title="Xóa hàng loạt?"
        description={`Bạn có chắc muốn chuyển ${selectedIds.length} câu hỏi đã chọn vào thùng rác?`}
      />
    </div>
  );
}
