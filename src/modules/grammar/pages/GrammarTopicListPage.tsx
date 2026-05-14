import { useQuery } from '@tanstack/react-query';
import { fetchPublicGrammarTopics } from '@/services/grammarClientApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, GraduationCap, Loader2, Star, Target } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';

export default function GrammarTopicListPage() {
  const { data: topics, isLoading } = useQuery<any[]>({
    queryKey: ['grammar', 'topics'],
    queryFn: fetchPublicGrammarTopics,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Đang tải danh sách chủ đề...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary bg-primary/5 rounded-full font-bold uppercase tracking-wider text-[10px]">
          Grammar Mastery
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
          Luyện tập ngữ pháp
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Nâng cao kỹ năng với hệ thống câu hỏi trắc nghiệm theo từng chủ đề chuyên sâu. 
          Luyện tập mỗi ngày để đạt điểm cao trong kỳ thi TOEIC.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics?.map((topic) => (
          <Card key={topic.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden flex flex-col">
            <div className="h-2 bg-gradient-to-r from-primary to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                  {topic.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2 h-10">
                  {topic.description || `Luyện tập các kiến thức về ${topic.name} với bộ câu hỏi chọn lọc.`}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-6">
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{topic._count.questions} câu hỏi</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Phổ biến</span>
                </div>
              </div>
              
              <Button asChild className="w-full h-11 rounded-xl shadow-md group-hover:shadow-lg transition-all gap-2">
                <Link to={`/grammar/${topic.slug}`}>
                  <GraduationCap className="w-4 h-4" />
                  Luyện tập ngay
                  <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {topics?.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
          <p className="text-muted-foreground">Hiện chưa có chủ đề luyện tập nào. Vui lòng quay lại sau!</p>
        </div>
      )}
    </div>
  );
}
