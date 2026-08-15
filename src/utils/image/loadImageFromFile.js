/**
 * Превращает File в HTMLImageElement.
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
      // URL можно освободить после загрузки, но img уже содержит данные
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error('Не удалось загрузить изображение из файла'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}