// src/services/image/imageCache.js

const urlCache = new Map();

/**
 * Сохраняет URL в кеш по id.
 */
export function setImageUrl(id, url) {
  urlCache.set(id, url);
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