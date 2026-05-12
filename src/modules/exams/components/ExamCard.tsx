import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Clock, FileText, Lock, CheckCircle2, Download } from 'lucide-react';
import type { ExamCardProps } from '@/types/exams';
import { cn } from '@/lib/utils';

export const ExamCard: React.FC<ExamCardProps> = (props) => {
  const { id, title, part, difficulty, type, totalQuestions, duration, variant } = props;

  const renderDifficultyBadge = () => {
    switch (difficulty) {
      case 'EASY':
        return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20 shadow-none">Easy</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 shadow-none">Medium</Badge>;
      case 'HARD':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 shadow-none">Hard</Badge>;
      default:
        return null;
    }
  };

  const renderTypeBadge = () => {
    if (type === 'VIP') {
      return (
        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 flex items-center gap-1 shadow-none">
          <Crown className="w-3 h-3" /> VIP
        </Badge>
      );
    }
    return <Badge className="bg-muted text-muted-foreground border-transparent hover:bg-muted/80 shadow-none">FREE</Badge>;
  };

  if (variant === 'library') {
    const { userBestScore, userRole, onVIPLockClick, onStart, onRetry, onViewResult, hasSession } = props;
    const isLocked = type === 'VIP' && userRole === 'STANDARD';
    const hasAttempted = userBestScore !== undefined;

    return (
      <Card className={cn("p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-md", isLocked ? "opacity-90 bg-muted/30" : "bg-card border-border")}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 shadow-none">{part}</Badge>
            {renderDifficultyBadge()}
          </div>
          {renderTypeBadge()}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-foreground line-clamp-2 mb-1">{title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {totalQuestions} câu</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {duration} phút</span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          {hasAttempted && (
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircle2 className="w-4 h-4" /> Best score: {userBestScore}
            </div>
          )}

          <div className="flex items-center gap-2">
            {isLocked ? (
              <Button 
                variant="default" 
                className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" 
                onClick={() => onVIPLockClick(id)}
              >
                <Lock className="w-4 h-4 mr-2" /> VIP Only
              </Button>
            ) : (
              <>
                {hasAttempted ? (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => onRetry?.(id)}>Làm lại</Button>
                    <Button variant="default" className="flex-1" onClick={() => onViewResult?.(id)}>Kết quả</Button>
                  </>
                ) : hasSession ? (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => onRetry?.(id)}>Làm lại</Button>
                    <Button variant="default" className="flex-1" onClick={() => onStart?.(id)}>Tiếp tục</Button>
                  </>
                ) : (
                  <Button variant="default" className="w-full" onClick={() => onStart?.(id)}>Bắt đầu</Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'history') {
    const { result, isSelected, userRole, onSelect, onExportPDF } = props;
    const isExportDisabled = userRole === 'STANDARD';
    // userRole is not in HistoryProps, so we might need a way to know if user is VIP to disable export. 
    // Wait, the prompt says "Export PDF disabled khi role=STANDARD". 
    // Let me check the provided types for ExamCardHistoryProps. It doesn't have userRole.
    // I will add it to the component logic as a prop or maybe assume we just disable it based on some logic, or I should update the type. 
    // For now, I'll assume we either need to add it to the type or the parent component handles the disabled state. I will add it to the type or just render the button and the parent can wrap it. Let's add `userRole?: 'STANDARD' | 'VIP' | 'ADMIN'` to base props or just to history props to be safe.
    // Let's modify the component to accept userRole in history props too. Wait, I shouldn't modify types without telling the user unless necessary. I will just render the button. To disable it, I need the role. Let's just assume `onExportPDF` would be passed if allowed, but the prompt says "Export PDF 🔒 VIP". So it might just be a button.
    
    return (
      <Card 
        className={cn(
          "p-5 flex flex-col gap-3 transition-all duration-200 cursor-pointer hover:shadow-md border",
          isSelected ? "ring-2 ring-primary border-transparent bg-primary/5" : "bg-card border-border"
        )}
        onClick={() => onSelect(result.id)}
      >
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 shadow-none px-2 py-0.5">{part}</Badge>
              {renderDifficultyBadge()}
            </div>
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">{title}</h3>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm mt-2 p-3 bg-muted/50 rounded-lg">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs mb-1">Điểm</span>
            <span className="font-bold text-primary">{result.score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs mb-1">Kết quả</span>
            <span className="font-semibold">{result.correctQ}/{result.totalQ}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs mb-1">Thời gian</span>
            <span className="font-semibold font-mono">{Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {/* Using standard string for date for now, format date-fns if preferred */}
            {new Date(result.submittedAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <div className="flex gap-2">
            {/* The parent handles actual clicks, so we stop propagation on these buttons */}
            {/* The PDF button might be disabled from parent, or we can just mock it here */}
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 text-xs bg-card"
              onClick={(e) => {
                e.stopPropagation();
                // onReview(result.id)
              }}
            >
              Xem lại
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              className={cn("h-8 text-xs gap-1", isExportDisabled && "opacity-50 cursor-not-allowed")}
              disabled={isExportDisabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!isExportDisabled && onExportPDF) onExportPDF(result.id);
              }}
            >
              <Download className="w-3 h-3" /> PDF {isExportDisabled && <Lock className="w-3 h-3 ml-1" />}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};
