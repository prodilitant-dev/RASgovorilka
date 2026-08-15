// src/services/image/revokeImageUrl.js

import { revokeImageUrl as revokeCache } from './imageCache';
import { logger } from '@utils/logger';

/**
 * Отзывает объектный URL для указанного id и удаляет из кеша.
 * @param {string} id
 * @returns {boolean} - был ли URL удалён
 */
export function revokeImageUrl(id) {
  const result = revokeCache(id);
  if (result) {
    logger.debug(`URL для изображения ${id} отозван`);
  } else {
    logger.debug(`Изображение ${id} не найдено в кеше`);
  }
  return result;
}