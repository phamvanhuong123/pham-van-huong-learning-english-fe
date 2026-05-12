import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface QuestionTableProps {
  questions: any[];
  isLoading?: boolean;
  onEdit: (q: any) => void;
  onDelete: (q: any) => void;
}

export function QuestionTable({ questions, isLoading, onEdit, onDelete }: QuestionTableProps) {
  if (isLoading) {
    return (
      <div className="border border-border rounded-lg bg-card p-8 text-center text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="border border-border rounded-lg bg-card p-12 text-center text-muted-foreground">
        Không tìm thấy câu hỏi nào phù hợp.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[80px]">ID / #</TableHead>
            <TableHead className="min-w-[200px]">Đề thi / Part</TableHead>
            <TableHead>Chủ đề</TableHead>
            <TableHead>Độ khó</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q) => (
            <TableRow key={q.id} className="hover:bg-muted/30">
              <TableCell className="font-medium text-muted-foreground">
                <span className="text-xs">{q.id.substring(0, 6)}</span>
                <br />
                <span className="text-foreground">Câu {q.order}</span>
              </TableCell>
              <TableCell>
                <div className="font-medium truncate max-w-[200px]">{q.exam?.title || 'Unknown Exam'}</div>
                <div className="text-xs text-muted-foreground">{q.exam?.part || 'N/A'}</div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{q.grammarTopic}</span>
              </TableCell>
              <TableCell>
                {q.difficulty === 'EASY' ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20 rounded-sm">Dễ</Badge>
                ) : q.difficulty === 'MEDIUM' ? (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 rounded-sm">Vừa</Badge>
                ) : (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 rounded-sm">Khó</Badge>
                )}
              </TableCell>
              <TableCell>
                {q.status === 'PUBLISHED' ? (
                  <span className="text-sm font-medium text-success">Published</span>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">Draft</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-primary"
                    onClick={() => onEdit(q)}
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(q)}
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
