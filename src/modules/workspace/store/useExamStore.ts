import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExamSession } from '../types';

interface ExamStoreState {
  // Store shape: Record<examId, SessionData>
  sessions: Record<string, Omit<ExamSession, 'examId'>>;
  initSession: (examId: string, duration: number) => void;
  selectAnswer: (examId: string, questionId: string, optionId: string | null) => void;
  toggleBookmark: (examId: string, questionId: string) => void;
  clearSession: (examId: string) => void;
}

export const useExamStore = create<ExamStoreState>()(
  persist(
    (set, get) => ({
      sessions: {},

      initSession: (examId, duration) => {
        const state = get();
        // Rule: chỉ tạo mới nếu CHƯA có session cho examId
        if (state.sessions[examId]) return;

        set((state) => ({
          sessions: {
            ...state.sessions,
            [examId]: {
              endTime: Date.now() + duration * 60 * 1000,
              answers: {},
              bookmarks: [],
            },
          },
        }));
      },

      selectAnswer: (examId, questionId, optionId) =>
        set((state) => {
          const session = state.sessions[examId];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [examId]: {
                ...session,
                answers: {
                  ...session.answers,
                  [questionId]: optionId,
                },
              },
            },
          };
        }),

      toggleBookmark: (examId, questionId) =>
        set((state) => {
          const session = state.sessions[examId];
          if (!session) return state;

          const bookmarks = session.bookmarks || [];
          const isBookmarked = bookmarks.includes(questionId);
          
          const newBookmarks = isBookmarked
            ? bookmarks.filter((id) => id !== questionId)
            : [...bookmarks, questionId];

          return {
            sessions: {
              ...state.sessions,
              [examId]: {
                ...session,
                bookmarks: newBookmarks,
              },
            },
          };
        }),

      clearSession: (examId) =>
        set((state) => {
          // Rule: xóa ĐÚNG session của examId, không ảnh hưởng session khác
          const newSessions = { ...state.sessions };
          delete newSessions[examId];
          return {
            sessions: newSessions,
          };
        }),
    }),
    {
      name: 'toeic_exam_sessions',
    }
  )
);
