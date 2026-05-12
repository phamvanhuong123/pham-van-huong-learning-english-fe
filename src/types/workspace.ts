export interface Option {
  id: string;
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  order: number;
  passage: string | null;
  questionText: string;
  options: Option[];
}

export interface Exam {
  id: string;
  title: string;
  part: 'PART5' | 'PART6' | 'PART7' | 'FULL';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: 'FREE' | 'VIP'; // Thêm trường type để check VIP guard
  duration: number;
  questions: Question[];
}

export interface SubmitAnswer {
  questionId: string;
  optionId: string | null;
}

export interface ExamSession {
  examId: string;
  endTime: number;
  answers: Record<string, string | null>;
  bookmarks: string[];
}
