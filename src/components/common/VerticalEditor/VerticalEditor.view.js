// src/components/common/VerticalEditor/VerticalEditor.view.js
import { createElement } from '@utils/dom';
import { renderPreview } from './VerticalEditor.preview';
import { renderFields } from './VerticalEditor.fields';
import { renderFooter } from './VerticalEditor.footer';

export function renderVerticalEditorContent({
  entity,
  title,
  fields,
  extraActions,
  buttons,
  preview,
  callbacks,
}) {
  const root = createElement('div', { className: 'vertical-editor' });

  // Шапка
  const header = createElement('div', { className: 've-header' });
  const headerTitle = createElement('span', { className: 've-title' }, title);
  const closeBtn = createElement('button', { className: 've-close-btn' }, '✕');
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

  // Дополнительные действия (например, «Падежи»)
  if (extraActions && extraActions.length > 0) {
    const actionsBlock = createElement('div', { className: 've-extra-actions' });
    extraActions.forEach(action => {
      const isVisible = typeof action.visible === 'function' ? action.visible(entity) : true;
      if (!isVisible) return;
      const btn = createElement('button', {
        className: 've-extra-action-btn',
        'data-action-id': action.id,
      }, action.label);
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