// src/services/image/imageCache.js
const urlCache = new Map();
const pendingCache = new Map(); // <-- Храним промисы для дедупликации
const MAX_CACHE_SIZE = 200; // Увеличили лимит

/**
 * Сохраняет URL в кеш по id.
 * Если кэш переполнен, удаляет самый старый URL.
 */
export function setImageUrl(id, url) {
  // Если такой ID уже есть, НЕ отзываем старый URL сразу,
  // чтобы не сломать изображение, которое сейчас грузится.
  // Просто перезаписываем.
  urlCache.set(id, url);

  if (urlCache.size > MAX_CACHE_SIZE) {
    const oldestKey = urlCache.keys().next().value;
    // Отзываем только если на него нет активных запросов
    if (!pendingCache.has(oldestKey)) {
      URL.revokeObjectURL(urlCache.get(oldestKey));
      urlCache.delete(oldestKey);
    }
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
 * Сохраняет промис загрузки, чтобы параллельные вызовы
 * не создавали дубликаты URL.
 */
export function setPendingRequest(id, promise) {
  pendingCache.set(id, promise);
  // Когда промис завершится (успешно или с ошибкой), убираем его из кэша ожиданий
  promise.finally(() => pendingCache.delete(id));
}

/**
 * Возвращает активный промис загрузки, если он есть.
 */
export function getPendingRequest(id) {
  return pendingCache.get(id);
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
  pendingCache.clear();
}

/**
 * Возвращает количество кешированных URL.
 */
export function getImageCacheSize() {
  return urlCache.size;
}
