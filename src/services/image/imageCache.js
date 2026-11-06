// src/services/image/imageCache.js
const urlCache = new Map();
const MAX_CACHE_SIZE = 50; // Максимальное количество URL в кэше

/**
 * Сохраняет URL в кеш по id.
 * Если кэш переполнен, удаляет самый старый URL.
 */
export function setImageUrl(id, url) {
  // Если такой ID уже есть, сначала отзываем старый URL
  if (urlCache.has(id)) {
    URL.revokeObjectURL(urlCache.get(id));
    urlCache.delete(id);
  }

  urlCache.set(id, url);

  // Ограничиваем размер кэша
  if (urlCache.size > MAX_CACHE_SIZE) {
    // Берем первый (самый старый) ключ
    const oldestKey = urlCache.keys().next().value;
    const oldestUrl = urlCache.get(oldestKey);
    URL.revokeObjectURL(oldestUrl);
    urlCache.delete(oldestKey);
  }
}

/**
 * Возвращает URL из кеша.
 */
export function getImageUrlFromCache(id) {
  return urlCache.get(id) || null;
}

/**
 * Проверяет, есть ли URL в кеше.
 */
export function hasImageUrl(id) {
  return urlCache.has(id);
}

/**
 * Удаляет URL из кеша и отзывает объектный URL.
 */
export function revokeImageUrl(id) {
  if (urlCache.has(id)) {
    const url = urlCache.get(id);
    URL.revokeObjectURL(url);
    urlCache.delete(id);
    return true;
  }
  return false;
}

/**
 * Очищает весь кеш.
 */
export function clearAllImageUrls() {
  for (const url of urlCache.values()) {
    URL.revokeObjectURL(url);
  }
  urlCache.clear();
}

/**
 * Возвращает количество кешированных URL.
 */
export function getImageCacheSize() {
  return urlCache.size;
}
