import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const vocabSchema = z.object({
  word: z.string().min(1, 'Vui lòng nhập từ vựng'),
  meaning: z.string().min(1, 'Vui lòng nhập nghĩa của từ'),
  example: z.string().optional(),
  topic: z.string().optional(),
});

type VocabFormValues = z.infer<typeof vocabSchema>;

interface AddVocabDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: VocabFormValues) => void;
  isLoading?: boolean;
}

export function AddVocabDialog({
  open,
  onClose,
  onAdd,
  isLoading = false,
}: AddVocabDialogProps) {
  const form = useForm({
    defaultValues: {
      word: '',
      meaning: '',
      example: '',
      topic: '',
    } as VocabFormValues,
    onSubmit: async ({ value }) => {
      onAdd(value);
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Thêm từ vựng mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin từ vựng bạn muốn lưu vào bộ sưu tập cá nhân.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-5 py-4"
        >
          {/* Field: Word */}
          <form.Field
            name="word"
            validators={{
              onChange: vocabSchema.shape.word,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className={field.state.meta.errors.length > 0 ? 'text-destructive' : ''}>
                  Từ / Cụm từ
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ví dụ: Persistent"
                  className={field.state.meta.errors.length > 0 ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Field: Meaning */}
          <form.Field
            name="meaning"
            validators={{
              onChange: vocabSchema.shape.meaning,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className={field.state.meta.errors.length > 0 ? 'text-destructive' : ''}>
                  Nghĩa
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ví dụ: Kiên trì, bền bỉ"
                  className={field.state.meta.errors.length > 0 ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Field: Topic */}
          <form.Field name="topic">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Chủ đề (Tùy chọn)</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ví dụ: Work, Daily life"
                />
              </div>
            )}
          </form.Field>

          {/* Field: Example */}
          <form.Field name="example">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Câu ví dụ (Tùy chọn)</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ví dụ: He was persistent in his efforts to find a job."
                  className="resize-none min-h-[100px]"
                />
              </div>
            )}
          </form.Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || isLoading}>
                  {(isSubmitting || isLoading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Lưu từ vựng
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
