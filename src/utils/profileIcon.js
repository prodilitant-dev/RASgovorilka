// src/utils/profileIcon.js
import { createElement, clear } from '@utils/dom';
import { iconUrl, isIconName } from '@utils/icon';
import { getImageUrl } from '@services/imageService';

function firstLetter(name) {
  if (!name) return '';
  return name.trim().charAt(0).toUpperCase();
}

function applyText(container, value) {
  clear(container);
  container.style.backgroundImage = 'none';
  container.textContent = value;
}

function applyImage(container, url, className) {
  clear(container);
  container.style.backgroundImage = 'none';
  const img = createElement('img', {
    src: url,
    alt: '',
    className: className || 'profile-fab__icon',
    draggable: 'false',
  });
  container.appendChild(img);
}

/**
 * Рендерит иконку профиля в контейнер.
 * Приоритет: imageId → icon (WebP или эмодзи) → первая буква имени → fallbackEmoji.
 *
 * @param {HTMLElement} container
 * @param {Object|null} profile
 * @param {Object} [options]
 * @param {boolean} [options.isEditing] — если true, показываем ✕ (выход из редактирования)
 * @param {string} [options.iconClassName='profile-fab__icon']
 * @param {string} [options.fallbackEmoji='👤']
 */
export function renderProfileIcon(container, profile, options = {}) {
  const { isEditing = false, iconClassName = 'profile-fab__icon', fallbackEmoji = '👤' } = options;

  // Режим редактирования → крестик close
  if (isEditing) {
    clear(container);
    const img = createElement('img', {
      src: iconUrl('close'),
      alt: '',
      className: iconClassName,
      draggable: 'false',
    });
    img.addEventListener('error', () => applyText(container, '✕'));
    container.appendChild(img);
    return;
  }

  if (!profile) {
    applyText(container, fallbackEmoji);
    return;
  }

  // 1. Фото пользователя
  if (profile.imageId) {
    clear(container);
    getImageUrl(profile.imageId).then((url) => {
      if (url) {
        applyImage(container, url, iconClassName);
      } else {
        applyFallback(container, profile, iconClassName, fallbackEmoji);
      }
    });
    return;
  }

  applyFallback(container, profile, iconClassName, fallbackEmoji);
}

function applyFallback(container, profile, iconClassName, fallbackEmoji) {
  const icon = profile.icon || '';
  const name = profile.name || '';

  // 2. WebP-иконка по имени
  if (icon && isIconName(icon)) {
    clear(container);
    const img = createElement('img', {
      src: iconUrl(icon),
      alt: '',
      className: iconClassName,
      draggable: 'false',
    });
    img.addEventListener('error', () => {
      applyText(container, firstLetter(name) || fallbackEmoji);
    });
    container.appendChild(img);
    return;
  }

  // 3. Эмодзи
  if (icon) {
    applyText(container, icon);
    return;
  }

  // 4. Первая буква имени
  const letter = firstLetter(name);
  if (letter) {
    applyText(container, letter);
    container.style.fontWeight = '700';
    return;
  }

  // 5. Fallback
  applyText(container, fallbackEmoji);
}
