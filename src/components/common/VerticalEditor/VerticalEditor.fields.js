// src/components/common/VerticalEditor/VerticalEditor.fields.js
import { createElement, on } from '@utils/dom';
import { iconUrl, isIconName } from '@utils/icon';

let idCounter = 0;
function generateId() {
  return `ve-field-${++idCounter}`;
}

export function renderFields(entity, fields, callbacks) {
  const container = createElement('div', { className: 've-fields' });

  fields.forEach((field) => {
    const isVisible = typeof field.visible === 'function' ? field.visible(entity) : true;
    if (!isVisible) return;

    const fieldWrap = createElement('div', { className: `ve-field ve-field-${field.type}` });
    const fieldId = generateId();
    const label = createElement('label', { className: 've-field-label', for: fieldId }, field.label);
    fieldWrap.appendChild(label);

    let inputEl = null;

    switch (field.type) {
      case 'text':
      case 'number':
      case 'time':
        inputEl = createElement('input', {
          type: field.type || 'text',
          id: fieldId,
          name: fieldId,
          value: entity[field.id] || '',
          placeholder: field.placeholder || '',
        });
        on(inputEl, 'input', (e) => {
          const value = e.target.value;
          entity[field.id] = value;
          if (field.onChange) field.onChange(value, entity);
          updatePreviewText(entity);
        });
        on(inputEl, 'change', (e) => {
          callbacks.onFieldChange(field.id, e.target.value);
        });
        break;

      case 'select':
        inputEl = createElement('select', { id: fieldId, name: fieldId });
        if (field.options) {
          field.options.forEach((opt) => {
            const option = createElement(
              'option',
              { value: typeof opt === 'string' ? opt : opt.value },
              typeof opt === 'string' ? opt : opt.label
            );
            if (entity[field.id] === option.value) option.selected = true;
            inputEl.appendChild(option);
          });
        }
        on(inputEl, 'change', (e) => callbacks.onFieldChange(field.id, e.target.value));
        break;

      case 'toggle': {
        const toggleWrapper = createElement('div', {
          className: 'toggle-wrapper',
          style: 'display:flex; justify-content:flex-end; pointer-events:auto;',
        });
        const toggleLabel = createElement('label', {
          className: 'toggle-switch',
          style: 'pointer-events:auto; cursor:pointer;',
        });
        const checkbox = createElement('input', {
          type: 'checkbox',
          id: fieldId,
          name: fieldId,
          checked: !!entity[field.id],
          style: 'pointer-events:auto;',
        });
        const slider = createElement('span', { className: 'slider' });
        toggleLabel.appendChild(checkbox);
        toggleLabel.appendChild(slider);
        toggleWrapper.appendChild(toggleLabel);

        checkbox.addEventListener('change', (e) => {
          const value = e.target.checked;
          entity[field.id] = value;
          if (field.onChange) field.onChange(value, entity);
          callbacks.onFieldChange(field.id, value);
        });

        inputEl = toggleWrapper;
        break;
      }

      default:
        inputEl = createElement('div', {}, 'Неизвестный тип поля');
    }

    if (inputEl) {
      fieldWrap.appendChild(inputEl);
      container.appendChild(fieldWrap);
    }
  });

  return container;
}

function updatePreviewText(entity) {
  const box = document.querySelector('.ve-preview-box');
  if (!box) return;
  if (entity.imageId) return;

  const emoji = entity.emoji || entity.icon || '';
  const text = entity.text || entity.name || '';

  let textEl = box.querySelector('.ve-preview-text');
  const existingImg = box.querySelector('.ve-preview-img');

  // Если стало именем иконки — рендерим картинку
  if (emoji && isIconName(emoji)) {
    if (existingImg) return; // уже показана
    if (textEl) textEl.textContent = '';
    const img = createElement('img', {
      src: iconUrl(emoji),
      alt: '',
      className: 've-preview-img',
      draggable: 'false',
    });
    img.style.maxWidth = '70%';
    img.style.maxHeight = '70%';
    img.style.objectFit = 'contain';
    img.addEventListener('error', () => {
      img.remove();
      if (textEl) textEl.textContent = text ? text.charAt(0).toUpperCase() : '➕';
    });
    box.appendChild(img);
    return;
  }

  // Иначе — эмодзи/буква
  if (existingImg) existingImg.remove();
  if (!textEl) {
    textEl = createElement('div', { className: 've-preview-text' });
    box.appendChild(textEl);
  }

  const isLetterFallback = !emoji && !!text;
  textEl.textContent = emoji || (text ? text.charAt(0).toUpperCase() : '➕');

  if (isLetterFallback) {
    textEl.style.color = 'var(--text-muted)';
    textEl.style.opacity = '0.4';
    textEl.style.fontSize = '3em';
  } else {
    textEl.style.color = '';
    textEl.style.opacity = '';
    textEl.style.fontSize = '';
  }
}