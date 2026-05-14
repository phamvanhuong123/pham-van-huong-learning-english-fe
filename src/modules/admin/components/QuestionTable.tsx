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
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import type { Question } from '@/types/admin';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuestionTableProps {
  questions: Question[];
  isLoading?: boolean;
  onEdit: (q: Question) => void;
  onDelete: (q: Question) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function QuestionTable({ questions, isLoading, onEdit, onDelete, selectedIds = [], onSelectionChange }: QuestionTableProps) {
  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === questions.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(questions.map(q => q.id));
    }
  };

  const toggleOne = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };
  console.log(questions)
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
    <div className="border border-border rounded-lg bg-card h-full flex flex-col overflow-hidden shadow-sm">
      <div className="flex-1 overflow-auto min-h-0 custom-scrollbar relative">
        <Table>
          <TableHeader className="bg-muted/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[40px] h-12">
                <Checkbox 
                  checked={questions.length > 0 && selectedIds.length === questions.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="w-[100px] h-12 font-semibold">ID / #</TableHead>
              <TableHead className="min-w-[300px] h-12 font-semibold text-foreground">Đề thi / Part</TableHead>
              <TableHead className="h-12 font-semibold text-foreground">Chủ đề</TableHead>
              <TableHead className="h-12 font-semibold text-foreground">Độ khó</TableHead>
              <TableHead className="h-12 font-semibold text-foreground">Trạng thái</TableHead>
              <TableHead className="text-center h-12 font-semibold text-foreground">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q) => (
              <TableRow key={q.id} className={cn(
                "group hover:bg-muted/40 transition-colors border-b border-border/50",
                selectedIds.includes(q.id) && "bg-primary/5"
              )}>
                <TableCell className="py-4">
                  <Checkbox 
                    checked={selectedIds.includes(q.id)}
                    onCheckedChange={() => toggleOne(q.id)}
                  />
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{q.id.substring(0, 6)}</span>
                    <span className="text-sm font-semibold text-foreground">Câu {q.order}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="font-medium text-foreground truncate max-w-[400px] hover:text-primary transition-colors cursor-default">
                          {q?.examTitle || 'Unknown Exam'}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="start" className="max-w-xs">
                        <p className="text-xs">{q?.examTitle}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm text-muted-foreground font-medium">{q.grammarTopic}</span>
                </TableCell>
                <TableCell className="py-4">
                  {q.difficulty === 'EASY' ? (
                    <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-tight">Dễ</Badge>
                  ) : q.difficulty === 'MEDIUM' ? (
                    <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-tight">Vừa</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-rose-500/5 text-rose-600 border-rose-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-tight">Khó</Badge>
                  )}
                </TableCell>
                <TableCell className="py-4">
                  {q.status === 'PUBLISHED' ? (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-tighter">Published</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      <span className="text-xs font-semibold uppercase tracking-tighter">Draft</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                      onClick={() => onEdit(q)}
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
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
    </div>
  );
}
