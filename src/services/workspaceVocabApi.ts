import api from '@/lib/axios';

export const addVocab = async (word: string, example?: string) => {
  const { data } = await api.post('/vocab', { word, example });
  return data;
};
