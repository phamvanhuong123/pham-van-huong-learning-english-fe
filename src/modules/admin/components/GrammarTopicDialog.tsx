import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { GrammarTopicItem, GrammarTopicCreateBody } from '@/types/admin';
import { slugify } from '@/utils/string';

interface GrammarTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: GrammarTopicCreateBody) => Promise<void>;
  initialData?: GrammarTopicItem | null;
  isPending: boolean;
}

export function GrammarTopicDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  isPending,
}: GrammarTopicDialogProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setSlug(initialData.slug);
        setDescription(initialData.description || '');
      } else {
        setName('');
        setSlug('');
        setDescription('');
      }
    }
  }, [open, initialData]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData) {
      // Tự động tạo slug nếu là tạo mới
      setSlug(slugify(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, slug, description });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề ngữ pháp mới'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên chủ đề <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder="VD: Thì hiện tại đơn, Danh từ đếm được..."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL) <span className="text-red-500">*</span></Label>
            <Input
              id="slug"
              placeholder="vd: thi-hien-tai-don"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            <p className="text-[10px] text-muted-foreground italic">
              * Dùng để tạo link URL đẹp. VD: toeic.com/practice/grammar/thi-hien-tai-don
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả ngắn gọn về chủ đề này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || !name || !slug}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initialData ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
