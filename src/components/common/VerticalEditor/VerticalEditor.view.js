// src/components/common/VerticalEditor/VerticalEditor.view.js
import { createElement, clear, on } from '@utils/dom';
import { getImageUrl } from '@services/image';
import { logger } from '@utils/logger';

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

  // --- Шапка ---
  const header = createElement('div', { className: 've-header' });
  const headerTitle = createElement('span', { className: 've-title' }, title);
  const closeBtn = createElement('button', { className: 've-close-btn' }, '✕');
  on(closeBtn, 'click', callbacks.onClose);
  header.appendChild(headerTitle);
  header.appendChild(closeBtn);
  root.appendChild(header);

  // --- Превью ---
  if (preview !== false) {
    const previewBlock = createElement('div', { className: 've-preview-block' });
    const previewBox = createElement('div', {
      className: 've-preview-box',
      'data-has-image': !!entity.imageId,
    });

    if (entity.imageId) {
      previewBox.classList.add('loading');
      getImageUrl(entity.imageId).then(url => {
        previewBox.classList.remove('loading');
        if (url) {
          previewBox.style.backgroundImage = `url(${url})`;
          previewBox.style.backgroundSize = 'cover';
          previewBox.style.backgroundPosition = 'center';
          const textEl = previewBox.querySelector('.ve-preview-text');
          if (textEl) textEl.textContent = '';
        } else {
          showFallback(previewBox, entity);
        }
      });
    } else {
      showFallback(previewBox, entity);
    }

    function showFallback(box, ent) {
      const emoji = ent.emoji || ent.icon || '';
      const text = ent.text || ent.name || '';
      const fallbackText = emoji || (text ? text.charAt(0).toUpperCase() : '➕');
      box.style.backgroundImage = 'none';
      box.style.background = 'var(--bg)';
      let textEl = box.querySelector('.ve-preview-text');
      if (!textEl) {
        textEl = createElement('div', { className: 've-preview-text' });
        box.appendChild(textEl);
      }
      textEl.textContent = fallbackText;
    }

    // Клик по превью — загрузка фото
    on(previewBox, 'click', () => {
      const input = createElement('input', { type: 'file', accept: 'image/*' });
      on(input, 'change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          await callbacks.onUploadImage(file);
        }
        input.remove();
      });
      input.click();
    });

    // Кнопка удаления фото (если есть)
    if (entity.imageId) {
      const removeBtn = createElement('button', { className: 've-preview-remove' }, '✕');
      on(removeBtn, 'click', (e) => {
        e.stopPropagation();
        callbacks.onRemoveImage();
      });
      previewBox.appendChild(removeBtn);
    }

    previewBlock.appendChild(previewBox);
    root.appendChild(previewBlock);
  }

  // --- Поля формы ---
  const fieldsBlock = createElement('div', { className: 've-fields' });

  fields.forEach(field => {
    let isVisible = true;
    if (typeof field.visible === 'function') {
      isVisible = field.visible(entity);
    }
    if (!isVisible) return;

    const fieldWrap = createElement('div', {
      className: `ve-field ve-field-${field.type}`,
    });

    const label = createElement('label', { className: 've-field-label' }, field.label);
    fieldWrap.appendChild(label);

    let inputEl = null;

    switch (field.type) {
      case 'text':
      case 'number':
      case 'time':
        inputEl = createElement('input', {
          type: field.type || 'text',
          value: entity[field.id] || '',
          placeholder: field.placeholder || '',
        });
        // 🔥 При вводе: обновляем только entity и вызываем field.onChange (если есть)
        on(inputEl, 'input', (e) => {
          const value = e.target.value;
          entity[field.id] = value; // обновляем локально
          // Если поле должно автосохраняться — вызываем onChange
          if (field.onChange) {
            field.onChange(value, entity);
          }
          // Обновляем превью (если это имя или текст)
          const previewText = root.querySelector('.ve-preview-text');
          if (previewText && !entity.imageId) {
            const emoji = entity.emoji || entity.icon || '';
            const text = entity.text || entity.name || '';
            previewText.textContent = emoji || (text ? text.charAt(0).toUpperCase() : '➕');
          }
          // НЕ вызываем callbacks.onFieldChange, чтобы не перерисовывать
        });
        // 🔥 При потере фокуса (или изменении) — сохраняем и перерисовываем
        on(inputEl, 'change', (e) => {
          const value = e.target.value;
          callbacks.onFieldChange(field.id, value);
        });
        break;

      case 'select':
        inputEl = createElement('select', {});
        if (field.options) {
          field.options.forEach(opt => {
            const option = createElement('option', {
              value: typeof opt === 'string' ? opt : opt.value,
            }, typeof opt === 'string' ? opt : opt.label);
            if (entity[field.id] === option.value) option.selected = true;
            inputEl.appendChild(option);
          });
        }
        // Для select change срабатывает сразу — перерисовка ок, фокус не теряется
        on(inputEl, 'change', (e) => {
          const value = e.target.value;
          callbacks.onFieldChange(field.id, value);
        });
        break;

      default:
        inputEl = createElement('div', {}, 'Неизвестный тип поля');
    }

    if (inputEl) {
      fieldWrap.appendChild(inputEl);
      fieldsBlock.appendChild(fieldWrap);
    }
  });

  root.appendChild(fieldsBlock);

  // --- Дополнительные действия ---
  if (extraActions && extraActions.length > 0) {
    const actionsBlock = createElement('div', { className: 've-extra-actions' });
    extraActions.forEach(action => {
      let isVisible = true;
      if (typeof action.visible === 'function') {
        isVisible = action.visible(entity);
      }
      if (!isVisible) return;

      const btn = createElement('button', {
        className: 've-extra-action-btn',
        'data-action-id': action.id,
      }, action.label);

      on(btn, 'click', () => {
        callbacks.onExtraActionClick(action.id);
      });

      actionsBlock.appendChild(btn);
    });
    root.appendChild(actionsBlock);
  }

  // --- Футер (кнопки) ---
  const footer = createElement('div', { className: 've-footer' });

  buttons.forEach(btn => {
    const isVisible = typeof btn.visible === 'function' ? btn.visible(entity) : true;
    if (!isVisible) return;

    const el = createElement('button', {
      className: `ve-btn ve-btn-${btn.variant || 'secondary'}`,
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

  root.appendChild(footer);

  const cleanup = () => {};

  return { element: root, cleanup };
}