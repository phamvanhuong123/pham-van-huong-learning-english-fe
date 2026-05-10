import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useExamStore } from '@/modules/workspace/store/useExamStore';
import { submitExam as submitExamApi } from '@/modules/workspace/api/examApi';

export type SubmitTrigger = 'manual' | 'timeout';

interface SubmitExamOptions {
  examId: string;
  totalQuestions: number;
}

export const useSubmitExam = ({ examId, totalQuestions }: SubmitExamOptions) => {
  const navigate = useNavigate();
  const clearSession = useExamStore((state) => state.clearSession);
  const session = useExamStore((state) => state.sessions[examId]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const mutation = useMutation({
    mutationFn: (answers: { questionId: string; optionId: string | null }[]) => 
      submitExamApi(examId, answers),
    onSuccess: (data) => {
      toast.success('Nộp bài thành công!');
      clearSession(examId);
      navigate(`/result/${data.id}`);
    },
    onError: (error: any) => {
      console.error('Submit error:', error);
      // Xử lý case mất mạng (edge case)
      if (!navigator.onLine) {
        toast.error('Mất kết nối mạng!', {
          description: 'Bài làm đã được lưu tạm. Vui lòng thử lại khi có mạng.',
        });
      } else {
        toast.error('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
      }
    },
  });

  const executeSubmit = () => {
    if (!session) return;
    
    // Private logic: map answers từ store sang array đúng format API
    const answers = Object.entries(session.answers).map(([questionId, optionId]) => ({
      questionId,
      optionId,
    }));

    mutation.mutate(answers);
  };

  const submitExam = (trigger: SubmitTrigger) => {
    if (trigger === 'manual') {
      setShowConfirmModal(true);
    } else {
      // timeout -> nộp trực tiếp, bypass confirm
      executeSubmit();
    }
  };

  const answeredCount = session ? Object.keys(session.answers).filter(id => session.answers[id] !== null).length : 0;
  const isFullyAnswered = answeredCount === totalQuestions;
  const unansweredCount = totalQuestions - answeredCount;

  const confirmMessage = isFullyAnswered
    ? `Bạn đã trả lời tất cả ${totalQuestions} câu. Xác nhận nộp bài?`
    : `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc muốn nộp không?`;

  return {
    submitExam,
    executeSubmit,
    isPending: mutation.isPending,
    showConfirmModal,
    setShowConfirmModal,
    confirmMessage,
  };
};
