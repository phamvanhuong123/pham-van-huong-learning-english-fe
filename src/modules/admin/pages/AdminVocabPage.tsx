import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';
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
  FileSpreadsheet, 
  Trash2, 
  Volume2, 
  RefreshCw,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import { ImportVocabDialog } from '../components/ImportVocabDialog';

export default function AdminVocabPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);

  const { data, isLoading } = useQuery<{ vocabs: any[]; total: number }>({
    queryKey: ['admin', 'vocab', searchTerm],
    queryFn: () => adminApi.getVocabs({ search: searchTerm }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteVocab,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vocab'] });
      toast.success('Xóa từ vựng thành công');
    },
    onError: () => {
      toast.error('Xóa từ vựng thất bại');
    },
  });

  const playAudio = (word: string, audioUrl?: string | null) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        // Fallback to TTS if URL fails
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      });
    } else {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thư viện từ vựng</h1>
          <p className="text-muted-foreground">Quản lý kho từ vựng dùng chung cho toàn hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Thêm từ mới
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Danh sách từ vựng</CardTitle>
              <CardDescription>
                Hiển thị {data?.total || 0} từ vựng hệ thống
              </CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm từ hoặc nghĩa..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Từ vựng</TableHead>
                  <TableHead>Nghĩa (Tiếng Việt)</TableHead>
                  <TableHead>Phiên âm</TableHead>
                  <TableHead>Chủ đề</TableHead>
                  <TableHead>Phát âm</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : data?.vocabs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Không tìm thấy từ vựng nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.vocabs.map((vocab: any) => (
                    <TableRow key={vocab.id}>
                      <TableCell className="font-bold text-lg">{vocab.word}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{vocab.meaning}</TableCell>
                      <TableCell className="font-mono text-primary/70">{vocab.phonetic || '-'}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                          {vocab.topic || 'Chung'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => playAudio(vocab.word, vocab.audioUrl)}
                          className="h-8 w-8 hover:text-primary"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:text-primary"
                            disabled
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => {
                              if (confirm('Bạn có chắc chắn muốn xóa từ vựng này không?')) {
                                deleteMutation.mutate(vocab.id);
                              }
                            }}
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

      <ImportVocabDialog 
        open={isImportOpen} 
        onOpenChange={setIsImportOpen} 
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'vocab'] });
          setIsImportOpen(false);
        }}
      />
    </div>
  );
}
