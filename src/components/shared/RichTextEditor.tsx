import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  minHeight?: string;
}

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'clean']
  ],
};

const formats = [
  'bold', 'italic', 'underline',
  'list', 'bullet', 'link'
];

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder,
  error,
  className,
  minHeight = '150px'
}: RichTextEditorProps) {
  const cleanLabel = label?.replace(/\s?\*$/, '');
  const isRequired = label?.includes('*');

  return (
    <div className={cn("space-y-2", className)}>
      {cleanLabel && (
        <Label className="text-sm font-semibold text-foreground/90">
          {cleanLabel} {isRequired && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div 
        className={cn(
          "quill-editor-wrapper bg-card rounded-xl border transition-all duration-200 overflow-hidden shadow-sm",
          error ? "border-destructive ring-2 ring-destructive/20" : "border-input hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/60"
        )}
      >
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ minHeight }}
          className="rich-text-editor"
        />
      </div>
      {error && (
        <p className="text-xs text-destructive font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      
      <style>{`
        .rich-text-editor .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--muted)/0.5);
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .rich-text-editor .ql-toolbar.ql-snow button {
          border-radius: 6px;
          width: 28px;
          height: 28px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rich-text-editor .ql-toolbar.ql-snow button:hover {
          background: hsl(var(--primary)/0.1);
          color: hsl(var(--primary));
        }
        .rich-text-editor .ql-toolbar.ql-snow button.ql-active {
          background: hsl(var(--primary)/0.15);
          color: hsl(var(--primary));
        }
        .rich-text-editor .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 0.925rem;
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight};
          padding: 12px 16px;
          line-height: 1.6;
          color: hsl(var(--foreground));
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: hsl(var(--muted-foreground));
          opacity: 0.6;
          left: 16px;
        }
        .rich-text-editor .ql-snow.ql-toolbar button svg, 
        .rich-text-editor .ql-snow .ql-toolbar button svg {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </div>
  );
}
