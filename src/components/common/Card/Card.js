// src/components/common/Card/Card.js
import { createElement } from '@utils/dom';
import { getImageUrl } from '@services/imageService'; // импортируем

export function createCard({
  id,
  text = '',
  emoji = '',
  imageId = null,          // новый параметр
  isActive = false,
  isAdd = false,
  draggable = false,
  className = '',
  children = null,
}) {
  const card = createElement('div', {
    className: [
      'card',
      isActive && 'card--active',
      isAdd && 'card--add',
      className,
    ].filter(Boolean).join(' '),
    'data-id': id,
    'data-log': `card:${id || 'unknown'}`,
  });

  const bg = createElement('div', { className: 'card__bg' });

  if (isAdd) {
    bg.textContent = '➕';
  } else if (imageId) {
    // Есть фото – загружаем и показываем
    bg.textContent = ''; // очищаем
    bg.style.backgroundSize = 'contain';
    bg.style.backgroundPosition = 'center';
    bg.style.backgroundRepeat = 'no-repeat';
    getImageUrl(imageId).then(url => {
      if (url) {
        bg.style.backgroundImage = `url(${url})`;
      } else {
        // Не удалось загрузить – показываем эмодзи или заглушку
        bg.textContent = emoji || '📄';
        bg.style.backgroundImage = 'none';
      }
    });
  } else {
    // Нет фото – показываем эмодзи или заглушку
    bg.textContent = emoji || '📄';
  }

  card.appendChild(bg);

  if (!isAdd && text) {
    const label = createElement('div', { className: 'card__label' }, text);
    card.appendChild(label);
  }

  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => card.appendChild(child));
    } else {
      card.appendChild(children);
    }
  }

  if (draggable) {
    card.setAttribute('draggable', 'true');
  }

  return card;
}