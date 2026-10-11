// src/components/common/Card/Card.js
import { createElement } from '@utils/dom';
import { getImageUrl } from '@services/imageService';
import { iconUrl, isIconName } from '@utils/icon';

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
    draggable: 'false',
  });

  const bg = createElement('div', { className: 'card__bg' });

  function showLetterFallback() {
    bg.style.backgroundImage = 'none';
    bg.textContent = '';
    if (text) {
      bg.textContent = text.trim().charAt(0).toUpperCase();
      bg.style.fontSize = '2.5em';
      bg.style.fontWeight = '700';
      bg.style.color = 'var(--text-secondary)';
    } else {
      bg.textContent = '📄';
    }
  }

  function showIcon(name, fallbackEmoji) {
    bg.textContent = '';
    bg.style.backgroundImage = 'none';
    const img = createElement('img', {
      src: iconUrl(name),
      alt: '',
      className: 'card__icon',
      draggable: 'false',
    });
    img.addEventListener('error', () => {
      img.remove();
      if (fallbackEmoji) {
        bg.textContent = fallbackEmoji;
      } else {
        showLetterFallback();
      }
    });
    bg.appendChild(img);
  }

  function showEmojiFallback() {
    bg.style.backgroundImage = 'none';
    bg.textContent = emoji || (text ? text.trim().charAt(0).toUpperCase() : '📄');
  }

  if (isAdd) {
    showIcon('add', '➕');
  } else if (imageId) {
    bg.textContent = '';
    bg.style.backgroundSize = 'contain';
    bg.style.backgroundPosition = 'center';
    bg.style.backgroundRepeat = 'no-repeat';
    getImageUrl(imageId).then((url) => {
      if (url) {
        bg.style.backgroundImage = `url(${url})`;
      } else {
        showEmojiFallback();
      }
    });
  } else if (imagePath) {
    const base = import.meta.env.BASE_URL || '/';
    const url = base.endsWith('/') ? `${base}${imagePath}` : `${base}/${imagePath}`;
    const probe = new Image();
    probe.onload = () => {
      bg.textContent = '';
      bg.style.backgroundSize = 'contain';
      bg.style.backgroundPosition = 'center';
      bg.style.backgroundRepeat = 'no-repeat';
      bg.style.backgroundImage = `url(${url})`;
    };
    probe.onerror = () => showEmojiFallback();
    probe.src = url;
  } else if (emoji && isIconName(emoji)) {
    showIcon(emoji, null);
  } else {
    showEmojiFallback();
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