// src/utils/image/showCardImage.js
import { getImageUrl } from '@services/imageService';

/**
 * Универсальный рендер картинки карточки в элемент.
 * Приоритет: imageId (IndexedDB) → imagePath (/public) → emoji → первая буква текста.
 *
 * @param {HTMLElement} element - контейнер (очищается)
 * @param {Object} source - { imageId, imagePath, emoji, text }
 * @param {Object} [options]
 * @param {boolean} [options.cover=false] - background-size: cover (для игровых ячеек)
 * @param {string}  [options.fontSize='']  - размер шрифта для fallback
 */
export function showCardImage(element, source, options = {}) {
  const { cover = false, fontSize = '' } = options;

  // Сброс
  element.style.backgroundImage = 'none';
  element.style.backgroundSize = '';
  element.style.backgroundPosition = '';
  element.style.backgroundRepeat = '';
  element.textContent = '';

  const applyImage = (url) => {
    element.textContent = '';
    element.style.backgroundImage = `url(${url})`;
    element.style.backgroundSize = cover ? 'cover' : 'contain';
    element.style.backgroundPosition = 'center';
    element.style.backgroundRepeat = 'no-repeat';
  };

  const showFallback = () => {
    element.style.backgroundImage = 'none';
    if (source.emoji) {
      element.textContent = source.emoji;
    } else if (source.text) {
      element.textContent = source.text.trim().charAt(0).toUpperCase();
      element.style.fontSize = fontSize || '2em';
      element.style.fontWeight = '700';
      element.style.color = 'var(--text-secondary)';
    } else {
      element.textContent = '❓';
    }
  };

  // 1. Пользовательская картинка из IndexedDB
  if (source.imageId) {
    element.textContent = '🔄';
    getImageUrl(source.imageId).then((url) => {
      if (url) {
        applyImage(url);
      } else if (source.imagePath) {
        // Пробуем стоковую как fallback
        tryLoadPath(source.imagePath, applyImage, showFallback);
      } else {
        showFallback();
      }
    });
    return;
  }

  // 2. Стоковая картинка
  if (source.imagePath) {
    element.textContent = '🔄';
    tryLoadPath(source.imagePath, applyImage, showFallback);
    return;
  }

  // 3. Fallback
  showFallback();
}

function tryLoadPath(imagePath, onLoad, onError) {
  const base = import.meta.env.BASE_URL || '/';
  const url = base.endsWith('/') ? `${base}${imagePath}` : `${base}/${imagePath}`;
  const probe = new Image();
  probe.onload = () => onLoad(url);
  probe.onerror = () => onError();
  probe.src = url;
}