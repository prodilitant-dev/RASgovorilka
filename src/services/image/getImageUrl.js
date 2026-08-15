// src/services/image/getImageUrl.js

import { loadImage } from '@storage/imageStorage';
import { logger } from '@utils/logger';
import { getImageUrlFromCache, setImageUrl, hasImageUrl } from './imageCache';

/**
 * Возвращает объектный URL для изображения по id.
 * @param {string} id
 * @returns {Promise<string|null>}
 */
export async function getImageUrl(id) {
  if (!id) return null;

  // Проверяем кеш
  if (hasImageUrl(id)) {
    return getImageUrlFromCache(id);
  }

  try {
    const blob = await loadImage(id);
    if (!blob) {
      logger.warn(`Изображение ${id} не найдено в хранилище`);
      return null;
    }

    const url = URL.createObjectURL(blob);
    setImageUrl(id, url);
    return url;
  } catch (err) {
    logger.error('Ошибка загрузки изображения', err);
    return null;
  }
}