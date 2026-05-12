
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
import { Edit, Eye, EyeOff } from 'lucide-react';
import type { AdminExamItem } from '@/types/admin';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExamTableProps {
  exams: AdminExamItem[];
  isLoading?: boolean;
  onEdit: (e: AdminExamItem) => void;
  onToggleStatus: (e: AdminExamItem) => void;
}

export function ExamTable({ exams, isLoading, onEdit, onToggleStatus }: ExamTableProps) {
  if (isLoading) {
    return (
      <div className="border border-border rounded-lg bg-card p-8 text-center text-muted-foreground shadow-sm">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="border border-border rounded-lg bg-card p-12 text-center text-muted-foreground shadow-sm">
        Không tìm thấy đề thi nào phù hợp.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card h-full flex flex-col overflow-hidden shadow-sm">
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <Table>
          <TableHeader className="bg-muted/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[100px] h-12 font-semibold">Mã đề</TableHead>
              <TableHead className="min-w-[250px] h-12 font-semibold text-foreground">Tiêu đề</TableHead>
              <TableHead className="h-12 font-semibold text-foreground">Phân loại</TableHead>
              <TableHead className="h-12 font-semibold text-foreground text-center">Câu hỏi</TableHead>
              <TableHead className="h-12 font-semibold text-foreground">Độ khó</TableHead>
              <TableHead className="h-12 font-semibold text-foreground">Trạng thái</TableHead>
              <TableHead className="text-center h-12 font-semibold text-foreground">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((e) => (
              <TableRow key={e.id} className="group hover:bg-muted/40 transition-colors border-b border-border/50">
                <TableCell className="py-4">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    {e.id.substring(0, 8)}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="font-medium text-foreground truncate max-w-[300px] cursor-default">
                          {e.title}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="start" className="max-w-xs">
                        <p className="text-xs">{e.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="w-fit text-[10px] font-bold tracking-tight">
                      {e.part}
                    </Badge>
                    <span className={e.type === 'VIP' ? 'text-amber-600 text-[11px] font-bold' : 'text-emerald-600 text-[11px] font-bold'}>
                      {e.type}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <span className="text-sm font-semibold text-foreground">{e.questionCount}</span>
                </TableCell>
                <TableCell className="py-4">
                  {e.difficulty === 'EASY' ? (
                    <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-tight">Dễ</Badge>
                  ) : e.difficulty === 'MEDIUM' ? (
                    <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-tight">Vừa</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-rose-500/5 text-rose-600 border-rose-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-tight">Khó</Badge>
                  )}
                </TableCell>
                <TableCell className="py-4">
                  {e.isPublished ? (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-tighter">Công khai</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      <span className="text-xs font-semibold uppercase tracking-tighter">Bản nháp</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                      onClick={() => onEdit(e)}
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full ${
                        e.isPublished 
                        ? 'text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10' 
                        : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10'
                      }`}
                      onClick={() => onToggleStatus(e)}
                      title={e.isPublished ? "Gỡ bài" : "Công khai bài"}
                    >
                      {e.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
