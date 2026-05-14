import api from '@/lib/axios';
import type { 
  GrammarTopicItem, 
  GrammarTopicCreateBody, 
  GrammarTopicUpdateBody 
} from '@/types/admin';

export const fetchGrammarTopics = async (): Promise<GrammarTopicItem[]> => {
  const { data } = await api.get('/grammar-topics');
  return data;
};

export const createGrammarTopic = async (body: GrammarTopicCreateBody): Promise<GrammarTopicItem> => {
  const { data } = await api.post('/grammar-topics', body);
  return data;
};

export const updateGrammarTopic = async (id: string, body: GrammarTopicUpdateBody): Promise<GrammarTopicItem> => {
  const { data } = await api.patch(`/grammar-topics/${id}`, body);
  return data;
};

export const deleteGrammarTopic = async (id: string): Promise<void> => {
  await api.delete(`/grammar-topics/${id}`);
};
