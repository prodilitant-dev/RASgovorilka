// src/services/image/uploadImage.js

import { uid } from '@utils/id';
import { saveImage } from '@storage/imageStorage';
import { isValidImageType } from '@image-utils/isValidImageType';
import { resizeToSquare } from '@image-utils/resizeToSquare';
import { convertToWebP } from '@image-utils/convertToWebP';
import { toast } from '@utils/toast';

/**
 * Загружает изображение, обрабатывает (ресайз, конвертация) и сохраняет в IndexedDB.
 * @param {File} file - файл изображения
 * @param {Object} options
 * @param {number} options.size - размер квадрата (по умолчанию 512)
 * @param {boolean} options.convertToWebP - конвертировать в WebP (по умолчанию true)
 * @param {number} options.quality - качество WebP (0..1, по умолчанию 0.8)
 * @param {boolean} options.showToast - показывать уведомления (по умолчанию true)
 * @returns {Promise<string>} - id сохранённого изображения
 */
export async function uploadImage(file, options = {}) {
  const {
    size = 512,
    convertToWebP: doConvert = true,
    quality = 0.8,
    showToast = true,
  } = options;

  // 1. Проверка типа
  if (!isValidImageType(file)) {
    const msg = 'Неподдерживаемый формат изображения';
    if (showToast) toast(msg, 'error');
    throw new Error(msg);
  }

  try {
    // 2. Ресайз до квадрата
    let processedBlob = await resizeToSquare(file, size, 'image/png');

    // 3. Конвертация в WebP (если нужно)
    if (doConvert) {
      processedBlob = await convertToWebP(processedBlob, quality);
    }

    // 4. Генерация ID и сохранение
    const imageId = uid();
    await saveImage(imageId, processedBlob);

    if (showToast) toast('Изображение загружено', 'success');
    return imageId;
  } catch (err) {
    if (showToast) toast('Ошибка обработки изображения', 'error');
    throw err;
  }
}