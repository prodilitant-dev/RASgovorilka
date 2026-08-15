/**
 * Загружает изображение и возвращает его размеры.
 * @param {Blob} blob - Blob с изображением
 * @returns {Promise<{width: number, height: number}>}
 */
export function getImageDimensions(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error('Не удалось загрузить изображение'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}