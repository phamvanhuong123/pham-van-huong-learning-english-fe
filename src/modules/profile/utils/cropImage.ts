import type { CropPixels, CropResult } from '../types';

/**
 * Creates an HTMLImageElement from a URL.
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err) => reject(err));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

/**
 * Given a source image URL and pixel crop coordinates,
 * returns a Blob and a local object URL preview.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropPixels
): Promise<CropResult> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<CropResult>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const previewUrl = URL.createObjectURL(blob);
        resolve({ blob, previewUrl });
      },
      'image/jpeg',
      0.9
    );
  });
}
