
/**
 * Конвертирует Blob в DataURL.
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Ошибка чтения Blob'));
    reader.readAsDataURL(blob);
  });
}