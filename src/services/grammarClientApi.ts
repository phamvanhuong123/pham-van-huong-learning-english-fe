import api from '@/lib/axios';

export const fetchPublicGrammarTopics = async () => {
  const { data } = await api.get('/grammar/topics');
  return data;
};

export const fetchGrammarPractice = async (slug: string, limit: number = 10) => {
  const { data } = await api.get(`/grammar/practice/${slug}?limit=${limit}`);
  return data;
};
export const submitGrammarPractice = async (payload: {
  topicSlug?: string;
  answers: { questionId: string; optionId: string | null; isCorrect: boolean }[];
  timeTaken: number;
}) => {
  const { data } = await api.post('/grammar/submit', payload);
  return data;
};
