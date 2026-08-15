
import { loadImageFromFile } from './loadImageFromFile';

/**
 * Конвертирует Blob в WebP с заданным качеством.
 * @param {Blob} blob
 * @param {number} quality - 0..1 (по умолчанию 0.8)
 * @returns {Promise<Blob>}
 */
export function convertToWebP(blob, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blobResult) => {
        if (blobResult) resolve(blobResult);
        else reject(new Error('Не удалось создать WebP'));
      }, 'image/webp', quality);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось загрузить изображение для конвертации'));
    };
    img.src = url;
  });
}