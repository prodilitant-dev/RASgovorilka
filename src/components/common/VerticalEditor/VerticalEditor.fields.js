// src/components/common/VerticalEditor/VerticalEditor.fields.js
import { createElement, on } from '@utils/dom';

let idCounter = 0;
function generateId() {
  return `ve-field-${++idCounter}`;
}

export function renderFields(entity, fields, callbacks) {
  const container = createElement('div', { className: 've-fields' });

  fields.forEach(field => {
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
          field.options.forEach(opt => {
            const option = createElement('option', {
              value: typeof opt === 'string' ? opt : opt.value,
            }, typeof opt === 'string' ? opt : opt.label);
            if (entity[field.id] === option.value) option.selected = true;
            inputEl.appendChild(option);
          });
        }
        on(inputEl, 'change', (e) => {
          callbacks.onFieldChange(field.id, e.target.value);
        });
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

        const onToggleChange = (e) => {
          const value = e.target.checked;
          entity[field.id] = value;
          if (field.onChange) field.onChange(value, entity);
          callbacks.onFieldChange(field.id, value);
        };
        checkbox.addEventListener('change', onToggleChange);

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

/**
 * Обновляет текст в превью редактора при вводе.
 * Серый полупрозрачный цвет = fallback-заглушка (первая буква текста),
 * а не настоящее эмодзи.
 */
function updatePreviewText(entity) {
  const previewText = document.querySelector('.ve-preview-text');
  if (!previewText) return;
  if (entity.imageId) return;

  const emoji = entity.emoji || entity.icon || '';
  const text = entity.text || entity.name || '';
  const isLetterFallback = !emoji && !!text;
  const fallbackText = emoji || (text ? text.charAt(0).toUpperCase() : '➕');

  previewText.textContent = fallbackText;

  if (isLetterFallback) {
    previewText.style.color = 'var(--text-muted)';
    previewText.style.opacity = '0.4';
    previewText.style.fontSize = '3em';
  } else {
    previewText.style.color = '';
    previewText.style.opacity = '';
    previewText.style.fontSize = '';
  }
}