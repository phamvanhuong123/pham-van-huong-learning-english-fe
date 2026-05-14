import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGrammarTopics, createGrammarTopic, updateGrammarTopic, deleteGrammarTopic } from '@/services/grammarApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Trash2, 
  RefreshCw,
  Edit2,
  BookMarked,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { GrammarTopicDialog } from '../components/GrammarTopicDialog';
import type { GrammarTopicItem, GrammarTopicCreateBody } from '@/types/admin';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';

export default function AdminGrammarPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopicItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery<GrammarTopicItem[]>({
    queryKey: ['admin', 'grammar-topics'],
    queryFn: fetchGrammarTopics,
  });

  const saveMutation = useMutation({
    mutationFn: (body: GrammarTopicCreateBody) => 
      selectedTopic 
        ? updateGrammarTopic(selectedTopic.id, body) 
        : createGrammarTopic(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'grammar-topics'] });
      toast.success(selectedTopic ? 'Cập nhật chủ đề thành công' : 'Thêm chủ đề mới thành công');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGrammarTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'grammar-topics'] });
      toast.success('Xóa chủ đề thành công');
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa chủ đề thất bại');
    },
  });

  const filteredTopics = data?.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (topic: GrammarTopicItem) => {
    setSelectedTopic(topic);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTopic(null);
    setIsDialogOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setTopicToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookMarked className="w-8 h-8 text-primary" />
            Quản lý chủ đề ngữ pháp
          </h1>
          <p className="text-muted-foreground">Quản lý các chủ đề ngữ pháp để phân loại câu hỏi trong ngân hàng đề.</p>
        </div>
        <Button onClick={handleAddNew} className="shadow-md">
          <Plus className="mr-2 h-4 w-4" />
          Thêm chủ đề mới
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Danh sách chủ đề</CardTitle>
              <CardDescription>
                Hiển thị {filteredTopics.length} chủ đề ngữ pháp
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm chủ đề..."
                className="pl-9 bg-background/50 border-muted"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden bg-background">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold">Tên chủ đề</TableHead>
                  <TableHead className="font-semibold">Slug</TableHead>
                  <TableHead className="font-semibold text-center">Số câu hỏi</TableHead>
                  <TableHead className="font-semibold">Ngày tạo</TableHead>
                  <TableHead className="text-right font-semibold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      <span className="text-sm text-muted-foreground">Đang tải dữ liệu...</span>
                    </TableCell>
                  </TableRow>
                ) : filteredTopics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <HelpCircle className="h-10 w-10 mb-2 opacity-20" />
                        <span>Không tìm thấy chủ đề nào.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTopics.map((topic) => (
                    <TableRow key={topic.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-bold text-base text-foreground">{topic.name}</TableCell>
                      <TableCell className="font-mono text-xs text-primary/70">{topic.slug}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {topic._count?.questions || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(topic.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(topic)}
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteRequest(topic.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <GrammarTopicDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={(data) => saveMutation.mutateAsync(data)}
        initialData={selectedTopic}
        isPending={saveMutation.isPending}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => topicToDelete && deleteMutation.mutate(topicToDelete)}
        isLoading={deleteMutation.isPending}
        title="Xóa chủ đề ngữ pháp?"
        description="Việc này sẽ xóa vĩnh viễn chủ đề này. Các câu hỏi đang gắn với chủ đề này sẽ không bị xóa nhưng sẽ mất liên kết chủ đề. Bạn có chắc chắn?"
      />
    </div>
  );
}
