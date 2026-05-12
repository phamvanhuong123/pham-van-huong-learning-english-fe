import React, { useEffect, useState, useRef } from 'react';
import { useExamStore } from '@/modules/workspace/store/useExamStore';
import { cn } from '@/lib/utils';

interface ExamTimerProps {
  duration: number; // phút
  examId: string;
  onTimeUp: () => void;
  className?: string;
  hideLabel?: boolean; // Reserved for future use
}

export const ExamTimer: React.FC<ExamTimerProps> = ({ duration, examId, onTimeUp, className }) => {
  const { sessions, initSession } = useExamStore();
  const [remaining, setRemaining] = useState<number | null>(null);
  
  const onTimeUpRef = useRef(onTimeUp);
  const hasCalledOnTimeUp = useRef(false);

  // Update ref để tránh stale closure khi onTimeUp thay đổi
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // Khởi tạo session nếu chưa có
    initSession(examId, duration);

    const session = sessions[examId];
    const endTime = session?.endTime;

    if (!endTime) return; // Đợi session được init ở lượt render sau hoặc trong effect này

    const calculateRemaining = () => {
      const now = Date.now();
      const diff = Math.max(0, endTime - now);
      setRemaining(diff);

      if (diff === 0 && !hasCalledOnTimeUp.current) {
        hasCalledOnTimeUp.current = true;
        onTimeUpRef.current();
      }
    };

    // Tính toán lần đầu ngay lập tức
    calculateRemaining();

    // Dùng 500ms để đảm bảo hiển thị giây mượt mà và không bị lỡ nhịp
    const intervalId = setInterval(calculateRemaining, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, [examId, duration, initSession, sessions]);

  if (remaining === null) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // States dựa trên design-system.md
  const isWarning = totalSeconds <= 300; // <= 5 phút
  const isCritical = totalSeconds <= 60; // <= 1 phút

  return (
    <div
      className={cn(
        "font-mono px-3 py-1 rounded-md bg-muted text-foreground transition-all duration-300 min-w-[80px] text-center",
        isWarning && "bg-destructive/10 text-destructive animate-pulse",
        isCritical && "font-bold text-xl",
        className
      )}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};
