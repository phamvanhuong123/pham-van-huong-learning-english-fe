export interface Option {
  id: string;
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Passage {
  id: string;
  content?: string | null;
  order: number;
  mediaUrl?: string | null;
  mediaType: 'TEXT' | 'AUDIO' | 'IMAGE';
}

export interface Question {
  id: string;
  order: number;
  questionText: string;
  options: Option[];
  metadata?: any;
  passageGroupId?: string | null;
  passageGroup?: {
    id: string;
    passages: Passage[];
  } | null;
}

export interface Exam {
  id: string;
  title: string;
  part: 'PART1' | 'PART2' | 'PART3' | 'PART4' | 'PART5' | 'PART6' | 'PART7' | 'FULL';
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
