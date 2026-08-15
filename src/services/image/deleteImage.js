// src/services/image/deleteImage.js

import { deleteImage as deleteFromStorage } from '@storage/imageStorage';
import { revokeImageUrl } from './revokeImageUrl';
import { logger } from '@utils/logger';

/**
 * Удаляет изображение из хранилища и из кеша.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteImage(id) {
  if (!id) return false;

  // Удаляем из кеша (отзываем URL)
  revokeImageUrl(id);

  // Удаляем из IndexedDB
  try {
    await deleteFromStorage(id);
    logger.debug(`Изображение ${id} удалено`);
    return true;
  } catch (err) {
    logger.error(`Ошибка удаления изображения ${id}:`, err);
    return false;
  }
}