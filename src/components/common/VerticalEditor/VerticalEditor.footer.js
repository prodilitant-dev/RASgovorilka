// src/components/common/VerticalEditor/VerticalEditor.footer.js
import { createElement, on } from '@utils/dom';

export function renderFooter(entity, buttons, callbacks) {
  const footer = createElement('div', { className: 've-footer' });

  buttons.forEach(btn => {
    const isVisible = typeof btn.visible === 'function' ? btn.visible(entity) : true;
    if (!isVisible) return;

    const el = createElement('div', {
      className: `category ${btn.variant === 'primary' ? 'active' : ''} ${btn.variant === 'danger' ? 'category-danger' : ''}`,
    }, btn.label);

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