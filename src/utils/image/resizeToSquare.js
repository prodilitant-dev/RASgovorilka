/**
 * Обрезает изображение до квадрата (центрированно) и масштабирует до заданного размера.
 * @param {Blob} blob - исходное изображение
 * @param {number} size - размер стороны квадрата (по умолчанию 512)
 * @param {string} format - 'image/png' или 'image/webp' (по умолчанию 'image/png')
 * @param {number} quality - качество для WebP (0–1), по умолчанию 0.8
 * @returns {Promise<Blob>}
 */
export function resizeToSquare(blob, size = 512, format = 'image/png', quality = 0.8) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Центрированная обрезка
      const cropSize = Math.min(width, height);
      const sx = (width - cropSize) / 2;
      const sy = (height - cropSize) / 2;

      ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);

      URL.revokeObjectURL(url);

      // Конвертируем в нужный формат
      if (format === 'image/webp') {
        canvas.toBlob((blobResult) => {
          if (blobResult) resolve(blobResult);
          else reject(new Error('Не удалось создать WebP'));
        }, 'image/webp', quality);
      } else {
        canvas.toBlob((blobResult) => {
          if (blobResult) resolve(blobResult);
          else reject(new Error('Не удалось создать PNG'));
        }, 'image/png');
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось загрузить изображение для ресайза'));
    };
    img.src = url;
  });
}