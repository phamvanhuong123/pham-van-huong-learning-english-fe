import { useState, useEffect, useCallback } from 'react';

interface SelectionRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TextSelectionResult {
  text: string;
  example: string;
  rect: SelectionRect | null;
  clearSelection: () => void;
}

export const useTextSelection = (): TextSelectionResult => {
  const [text, setText] = useState('');
  const [example, setExample] = useState('');
  const [rect, setRect] = useState<SelectionRect | null>(null);

  const clearSelection = useCallback(() => {
    setText('');
    setExample('');
    setRect(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      // Đừng clear ngay lập tức để tránh click vào nút Lưu từ bị mất popup
      return;
    }

    const selectedText = selection.toString().trim();
    
    // Validate: anchorNode phải nằm trong .passage-content
    const anchorNode = selection.anchorNode;
    const passageElement = (anchorNode?.parentElement as HTMLElement)?.closest('.passage-content');
    
    if (!passageElement) {
      return;
    }

    // Validate rules:
    // 1. text.trim() === '' -> bỏ qua
    if (selectedText === '') return;

    // 2. text.split(/\s+/).length > 5 -> bỏ qua (quá nhiều từ)
    if (selectedText.split(/\s+/).length > 5) return;

    // 3. text.length < 2 -> bỏ qua
    if (selectedText.length < 2) return;

    const range = selection.getRangeAt(0);
    const boundingBox = range.getBoundingClientRect();

    setText(selectedText);
    setExample(passageElement.textContent || '');
    setRect({
      top: boundingBox.top + window.scrollY - 40, 
      left: boundingBox.left + boundingBox.width / 2,
      width: boundingBox.width,
      height: boundingBox.height,
    });
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, [handleSelection]);

  return { text, rect, clearSelection,example };
};
