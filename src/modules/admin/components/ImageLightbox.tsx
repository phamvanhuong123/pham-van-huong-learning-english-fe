import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageLightboxProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ imageUrl, isOpen, onClose }: ImageLightboxProps) {
  // Prevent scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>
      <div 
        className="relative max-w-[90vw] max-h-[90vh] overflow-hidden rounded-lg outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Hình ảnh xác nhận chuyển khoản"
          className="max-w-full max-h-[90vh] object-contain animate-in zoom-in-95 duration-200"
        />
      </div>
      {/* Click outside to close */}
      <div className="absolute inset-0 z-0 cursor-zoom-out" onClick={onClose} />
    </div>
  );
}
