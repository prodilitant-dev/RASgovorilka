// src/services/image/getImageUrl.js

import { loadImage } from '@storage/imageStorage';
import { logger } from '@utils/logger';
import {
  getImageUrlFromCache,
  setImageUrl,
  hasImageUrl,
  getPendingRequest,
  setPendingRequest,
} from './imageCache';

/**
 * Возвращает объектный URL для изображения по id.
 * Если запрос по этому id уже в полёте — возвращает тот же промис
 * (дедупликация: не создаём два blob-URL на одну картинку).
 * @param {string} id
 * @returns {Promise<string|null>}
 */
export async function getImageUrl(id) {
  if (!id) return null;

  if (hasImageUrl(id)) {
    return getImageUrlFromCache(id);
  }

  const pending = getPendingRequest(id);
  if (pending) {
    return pending;
  }

  const promise = (async () => {
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
  })();

  setPendingRequest(id, promise);
  return promise;
}
