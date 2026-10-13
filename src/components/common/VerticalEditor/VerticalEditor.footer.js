// src/components/common/VerticalEditor/VerticalEditor.footer.js
import { createElement, on } from '@utils/dom';

/** Убирает эмодзи-префикс из текста кнопки. */
function stripEmoji(label) {
  if (!label) return '';
  // Срезаем пробел + эмодзи в начале (если есть)
  return label.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+\s*/u, '').trim();
}

export function renderFooter(entity, buttons, callbacks) {
  const footer = createElement('div', { className: 've-footer' });

  buttons.forEach((btn) => {
    const isVisible = typeof btn.visible === 'function' ? btn.visible(entity) : true;
    if (!isVisible) return;

    const cleanLabel = stripEmoji(btn.label);
    const el = createElement(
      'div',
      {
        className: `category ${btn.variant === 'primary' ? 'active' : ''} ${btn.variant === 'danger' ? 'category-danger' : ''}`,
      },
      cleanLabel
    );

    if (btn.id === 'save') {
      on(el, 'click', callbacks.onSave);
    } else if (btn.id === 'delete') {
      on(el, 'click', callbacks.onDelete);
    } else if (btn.action) {
      on(el, 'click', () => btn.action(entity, callbacks.onClose));
    }

    footer.appendChild(el);
  });

  return footer;
}
