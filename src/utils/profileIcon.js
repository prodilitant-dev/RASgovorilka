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

export function renderProfileIcon(container, profile, options = {}) {
  const { isEditing = false, iconClassName = 'profile-fab__icon', fallbackEmoji = '👤' } = options;

  // Сбрасываем старые стили (на всякий случай, если они были установлены)
  container.style.borderColor = '';
  container.style.borderStyle = '';
  container.style.borderWidth = '';

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

  // УБРАЛИ БЛОК С ПРИМЕНЕНИЕМ ЦВЕТА

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

  if (profile.imagePath) {
    clear(container);
    const base = import.meta.env.BASE_URL || '/';
    const url = base.endsWith('/') ? `${base}${profile.imagePath}` : `${base}/${profile.imagePath}`;
    
    const probe = new Image();
    probe.onload = () => applyImage(container, url, iconClassName);
    probe.onerror = () => applyFallback(container, profile, iconClassName, fallbackEmoji);
    probe.src = url;
    return;
  }

  if (!profile.icon || profile.icon === 'profile-default') {
    const base = import.meta.env.BASE_URL || '/';
    const defaultUrl = `${base}icons/profiles.webp`;
    const probe = new Image();
    probe.onload = () => applyImage(container, defaultUrl, iconClassName);
    probe.onerror = () => applyFallback(container, profile, iconClassName, fallbackEmoji);
    probe.src = defaultUrl;
    return;
  }

  applyFallback(container, profile, iconClassName, fallbackEmoji);
}

function applyFallback(container, profile, iconClassName, fallbackEmoji) {
  const icon = profile.icon || '';
  const name = profile.name || '';

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

  if (icon) {
    applyText(container, icon);
    return;
  }

  const letter = firstLetter(name);
  if (letter) {
    applyText(container, letter);
    container.style.fontWeight = '700';
    return;
  }

  applyText(container, fallbackEmoji);
}