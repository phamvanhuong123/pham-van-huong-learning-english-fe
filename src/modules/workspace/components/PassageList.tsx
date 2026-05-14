
import { BookOpen } from 'lucide-react';
import { AudioPlayer } from '@/components/exam/AudioPlayer';
import type { Question } from '@/types/workspace';

interface PassageListProps {
  questions: Question[];
  examPart?: string;
  isVipPreview?: boolean;
}

export const PassageList = ({ questions, examPart, isVipPreview }: PassageListProps) => {
  const groups: { passageGroup: any; questions: Question[] }[] = [];

  questions.forEach((q) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && q.passageGroupId && lastGroup.passageGroup?.id === q.passageGroupId) {
      lastGroup.questions.push(q);
    } else {
      groups.push({ passageGroup: q.passageGroup || null, questions: [q] });
    }
  });

  const hasAnyPassage = questions.some((q) => q.passageGroup);

  return (
    <div className="max-w-4xl mx-auto p-8">
      {isVipPreview && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl text-center">
          <p className="text-warning font-medium text-sm">
            Đây là đề thi VIP. Bạn đang xem trước một phần nội dung.
          </p>
        </div>
      )}

      {groups.map((group, gIdx) => (
        group.passageGroup && group.passageGroup.passages && group.passageGroup.passages.length > 0 && (
          <div key={gIdx} className="mb-10 last:mb-0">
            <div className="mb-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded text-xs font-bold uppercase">
                Questions {group.questions[0].order} - {group.questions[group.questions.length - 1].order}
              </span>
            </div>
            <div className="space-y-6">
              {group.passageGroup.passages
                .sort((a: any, b: any) => a.order - b.order)
                .map((p: any) => (
                  <div key={p.id} className="space-y-4">
                    {p.mediaType === 'AUDIO' ? (
                      <AudioPlayer url={p.mediaUrl} className="mb-4" />
                    ) : p.mediaType === 'VIDEO' ? (
                      <div className="space-y-4 mb-4">
                        {examPart === 'PART1' && (
                          <div className="rounded-xl overflow-hidden border bg-white p-2 shadow-sm">
                            <img 
                              src={p.mediaUrl?.replace(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i, '.jpg')} 
                              alt="Passage illustration" 
                              className="w-full h-auto object-contain mx-auto" 
                            />
                          </div>
                        )}
                        <AudioPlayer url={p.mediaUrl} />
                      </div>
                    ) : p.mediaType === 'IMAGE' ? (
                      <div className="rounded-xl overflow-hidden border bg-white p-2 shadow-sm">
                        <img src={p.mediaUrl} alt="Passage illustration" className="w-full h-auto object-contain mx-auto" />
                      </div>
                    ) : (
                      p.mediaUrl ? (
                         /* Fallback logic */
                         p.mediaUrl.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i) ? (
                            <div className="space-y-4 mb-4">
                                {examPart === 'PART1' && (
                                <div className="rounded-xl overflow-hidden border bg-white p-2 shadow-sm">
                                    <img 
                                    src={p.mediaUrl.replace(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i, '.jpg')} 
                                    alt="Passage illustration" 
                                    className="w-full h-auto object-contain mx-auto" 
                                    />
                                </div>
                                )}
                                <AudioPlayer url={p.mediaUrl} />
                            </div>
                         ) : p.mediaUrl.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                            <AudioPlayer url={p.mediaUrl} className="mb-4" />
                         ) : (
                            <div className="rounded-xl overflow-hidden border bg-white p-2 shadow-sm">
                                <img src={p.mediaUrl} alt="Passage illustration" className="w-full h-auto object-contain mx-auto" />
                            </div>
                         )
                      ) : (
                        <div 
                          className="text-base md:text-lg leading-[1.8] passage-content font-sans text-foreground/90 bg-card p-8 md:p-10 rounded-2xl border shadow-sm break-words"
                          dangerouslySetInnerHTML={{ __html: p.content || '' }}
                        />
                      )
                    )}
                  </div>
                ))}
            </div>
          </div>
        )
      ))}

    </div>
  );
};
