import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { addVocab } from '@/services/workspaceVocabApi';
import { useClickAway } from '@/hooks/useClickAway';

interface VocabPopupProps {
  word: string;
  rect: { top: number; left: number };
  onClose: () => void;
  example?: string;
}

export const VocabPopup: React.FC<VocabPopupProps> = ({ word, rect, onClose, example }) => {
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Đóng khi click ra ngoài
  useClickAway(ref, onClose);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await addVocab(word, example);
      toast.success(`Đã thêm "${word}" vào sổ từ vựng!`, {
        description: "Bạn có thể ôn tập từ này trong phần Sổ từ vựng."
      });
      onClose();
    } catch (error: any) {
      const status = error.response?.status;
      const errorCode = error.response?.data?.errorCode;

      if (status === 409) {
        toast.error(`Từ "${word}" đã có trong danh sách của bạn.`);
      } else if (status === 403 && errorCode === 'VOCAB_LIMIT_REACHED') {
        toast.error("Đã đạt giới hạn 50 từ!", {
          description: "Nâng cấp VIP để lưu không giới hạn và học tập hiệu quả hơn.",
          action: {
            label: "Nâng cấp VIP",
            onClick: () => window.open('/pricing', '_blank'),
          },
        });
      } else {
        toast.error("Không thể thêm từ vựng. Vui lòng thử lại.");
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={ref}
      className="fixed z-[100] animate-in fade-in zoom-in duration-200 pointer-events-auto"
      style={{
        top: rect.top,
        left: rect.left,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="bg-popover text-popover-foreground border border-border shadow-xl rounded-lg p-2 flex items-center gap-2 overflow-hidden min-w-[120px]">
        <div className="px-3 py-1 flex flex-col">
          <span className="text-sm font-bold truncate max-w-[150px]">{word}</span>
        </div>
        <Button 
          size="sm" 
          onClick={handleAdd} 
          disabled={loading}
          className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          {loading ? 'Đang thêm...' : 'Lưu từ'}
        </Button>
      </div>
      {/* Mũi tên nhỏ phía dưới (Arrow) */}
      <div className="w-3 h-3 bg-popover border-r border-b border-border rotate-45 mx-auto -mt-1.5 shadow-sm" />
    </div>
  );
};
