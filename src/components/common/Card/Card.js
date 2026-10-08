// src/components/common/Card/Card.js
import { createElement } from '@utils/dom';
import { getImageUrl } from '@services/imageService';

export function createCard({
  id,
  text = '',
  emoji = '',
  imageId = null,
  imagePath = null,
  isActive = false,
  isAdd = false,
  className = '',
  children = null,
}) {
  const card = createElement('div', {
    className: [
      'card',
      isActive && 'card--active',
      isAdd && 'card--add',
      className,
    ]
      .filter(Boolean)
      .join(' '),
    'data-id': id,
    'data-log': `card:${id || 'unknown'}`,
    draggable: 'false', // отключаем HTML5 drag, используем Pointer Events
  });

  const bg = createElement('div', { className: 'card__bg' });

  function showFallback() {
    bg.style.backgroundImage = 'none';
    if (emoji) {
      bg.textContent = emoji;
    } else if (text) {
      bg.textContent = text.trim().charAt(0).toUpperCase();
      bg.style.fontSize = '2.5em';
      bg.style.fontWeight = '700';
      bg.style.color = 'var(--text-secondary)';
    } else {
      bg.textContent = '📄';
    }
  }

  if (isAdd) {
    bg.textContent = '➕';
  } else if (imageId) {
    bg.textContent = '';
    bg.style.backgroundSize = 'contain';
    bg.style.backgroundPosition = 'center';
    bg.style.backgroundRepeat = 'no-repeat';
    getImageUrl(imageId).then((url) => {
      if (url) {
        bg.style.backgroundImage = `url(${url})`;
      } else {
        showFallback();
      }
    });
  } else if (imagePath) {
    const base = import.meta.env.BASE_URL || '/';
    const url = base.endsWith('/')
      ? `${base}${imagePath}`
      : `${base}/${imagePath}`;

    const probe = new Image();
    probe.onload = () => {
      bg.textContent = '';
      bg.style.backgroundSize = 'contain';
      bg.style.backgroundPosition = 'center';
      bg.style.backgroundRepeat = 'no-repeat';
      bg.style.backgroundImage = `url(${url})`;
    };
    probe.onerror = () => showFallback();
    probe.src = url;
  } else {
    showFallback();
  }

  card.appendChild(bg);

  if (!isAdd && text) {
    const label = createElement('div', { className: 'card__label' }, text);
    card.appendChild(label);
  }

  if (children) {
    if (Array.isArray(children)) {
      children.forEach((child) => card.appendChild(child));
    } else {
      card.appendChild(children);
    }
  }

  return card;
}