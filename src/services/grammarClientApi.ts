import api from '@/lib/axios';

export const fetchPublicGrammarTopics = async () => {
  const { data } = await api.get('/grammar/topics');
  return data;
};

export const fetchGrammarPractice = async (slug: string, limit: number = 10) => {
  const { data } = await api.get(`/grammar/practice/${slug}?limit=${limit}`);
  return data;
};
