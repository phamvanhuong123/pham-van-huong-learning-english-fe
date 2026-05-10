import api from '@/lib/axios';
import type { Exam } from '../types';

export const fetchExamById = async (examId: string): Promise<Exam> => {
  const { data } = await api.get(`/exams/${examId}`);
  return data;
};

export const submitExam = async (examId: string, answers: { questionId: string; optionId: string | null }[]) => {
  const { data } = await api.post(`/exams/${examId}/submit`, { answers });
  return data;
};
