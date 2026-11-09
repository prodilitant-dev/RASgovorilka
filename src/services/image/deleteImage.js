// src/services/image/deleteImage.js
import { deleteImage as deleteFromDB } from '@storage/imageStorage';
import { revokeImageUrl } from './revokeImageUrl'; // <-- ДОБАВЛЕНО
import { logger } from '@utils/logger';

export async function deleteImage(id) {
  try {
    // 1. Удаляем из кэша URL (освобождаем память)
    revokeImageUrl(id);

    // 2. Удаляем из IndexedDB
    const success = await deleteFromDB(id);
    return success;
  } catch (err) {
    logger.error(`Ошибка удаления изображения ${id}:`, err);
    return false;
  }
}
