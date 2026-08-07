// src/components/common/Card/Card.js
import { createElement } from '@utils/dom';

export function createCard({
  id,
  text = '',
  emoji = '',
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

  const bg = createElement('div', { className: 'card__bg' }, isAdd ? '➕' : (emoji || '📄'));
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