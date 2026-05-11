import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Camera, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getCroppedImg } from '../utils/cropImage';
import type { CropPixels } from '../types';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

interface AvatarUploaderProps {
  currentAvatarUrl: string | null;
  previewUrl: string | null;        // optimistic preview
  isUploading: boolean;
  onCropComplete: (blob: Blob, previewUrl: string) => void;
}

export function AvatarUploader({
  currentAvatarUrl,
  previewUrl,
  isUploading,
  onCropComplete,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropPixels | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // ── File picker handler ──────────────────────────────────────────────────────
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Client-side size validation — block before crop
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 2 MB.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          setImageSrc(reader.result);
          setCropDialogOpen(true);
        }
      });
      reader.readAsDataURL(file);
      e.target.value = ''; // allow re-select same file
    },
    []
  );

  const onCropAreaChange = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels as CropPixels);
  }, []);

  // ── Confirm crop ─────────────────────────────────────────────────────────────
  const handleConfirmCrop = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const { blob, previewUrl: localPreview } = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCropDialogOpen(false);
      setImageSrc(null);
      onCropComplete(blob, localPreview);
    } catch {
      toast.error('Không thể cắt ảnh. Vui lòng thử lại.');
    } finally {
      setIsCropping(false);
    }
  }, [imageSrc, croppedAreaPixels, onCropComplete]);

  const displayUrl = previewUrl ?? currentAvatarUrl;

  return (
    <>
      {/* ── Avatar display + trigger ── */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          id="avatar-upload-trigger"
          className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-border bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-label="Thay đổi ảnh đại diện"
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Ảnh đại diện"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </div>
        </button>

        <p className="text-xs text-muted-foreground">
          Click để thay đổi · JPEG, PNG, WebP · tối đa 2 MB
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {/* ── Crop Dialog ── */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Cắt ảnh đại diện</DialogTitle>
          </DialogHeader>

          {/* Crop area */}
          <div className="relative w-full h-72 bg-black">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropAreaChange}
              />
            )}
          </div>

          {/* Zoom slider */}
          <div className="px-6 py-3">
            <label className="text-xs text-muted-foreground block mb-1">
              Thu phóng
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Thu phóng ảnh"
            />
          </div>

          <DialogFooter className="px-6 pb-6 gap-2">
            <Button
              variant="outline"
              id="avatar-crop-cancel-btn"
              onClick={() => {
                setCropDialogOpen(false);
                setImageSrc(null);
              }}
              disabled={isCropping}
            >
              Hủy
            </Button>
            <Button
              id="avatar-crop-confirm-btn"
              onClick={handleConfirmCrop}
              disabled={isCropping}
            >
              {isCropping && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
