// src/components/common/VerticalEditor/VerticalEditor.view.js
import { createElement } from '@utils/dom';
import { renderFields } from './fields/index.js';
import { renderPreview } from './preview/index.js';
import { renderFooter } from './VerticalEditor.footer';
import { iconUrl } from '@utils/icon';

export function renderVerticalEditorContent({
  entity,
  title,
  fields,
  extraActions,
  extraContent,
  buttons,
  preview,
  callbacks,
}) {
  const root = createElement('div', { className: 'vertical-editor' });

  // Шапка
  const header = createElement('div', { className: 've-header' });
  const headerTitle = createElement('span', { className: 've-title' }, title);
  const closeBtn = createElement('button', {
    type: 'button',
    className: 've-close-btn',
    'aria-label': 'Закрыть',
  });
  const closeImg = createElement('img', {
    src: iconUrl('close'),
    alt: '',
    className: 've-close-btn__icon',
    draggable: 'false',
  });
  closeImg.addEventListener('error', () => {
    closeImg.replaceWith(document.createTextNode('✕'));
  });
  closeBtn.appendChild(closeImg);
  closeBtn.addEventListener('click', callbacks.onClose);
  header.appendChild(headerTitle);
  header.appendChild(closeBtn);
  root.appendChild(header);

  // Превью (если нужно)
  if (preview !== false) {
    const previewEl = renderPreview(entity, callbacks);
    root.appendChild(previewEl);
  }

  // Поля формы
  const fieldsEl = renderFields(entity, fields, callbacks);
  root.appendChild(fieldsEl);

  // Дополнительный контент (например, палитра цветов)
  if (extraContent) {
    const contentEl = extraContent(entity, callbacks);
    if (contentEl) {
      root.appendChild(contentEl);
    }
  }

  // Дополнительные действия (например, «Падежи»)
  if (extraActions && extraActions.length > 0) {
    const actionsBlock = createElement('div', { className: 've-extra-actions' });
    extraActions.forEach((action) => {
      const isVisible = typeof action.visible === 'function' ? action.visible(entity) : true;
      if (!isVisible) return;
      const btn = createElement(
        'button',
        {
          className: 've-extra-action-btn',
          'data-action-id': action.id,
        },
        action.label
      );
      btn.addEventListener('click', () => callbacks.onExtraActionClick(action.id));
      actionsBlock.appendChild(btn);
    });
    root.appendChild(actionsBlock);
  }

  // Футер с кнопками
  const footerEl = renderFooter(entity, buttons, callbacks);
  root.appendChild(footerEl);

  return { element: root, cleanup: () => {} };
}