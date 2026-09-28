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
          // обновляем превью (если имя/текст изменились)
          const previewText = document.querySelector('.ve-preview-text');
          if (previewText && !entity.imageId) {
            const emoji = entity.emoji || entity.icon || '';
            const text = entity.text || entity.name || '';
            previewText.textContent = emoji || (text ? text.charAt(0).toUpperCase() : '➕');
          }
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
        // Упрощённый переключатель — полагаемся на стандартное поведение <label>
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

        // Обработчик изменения
        const onToggleChange = (e) => {
          const value = e.target.checked;
          entity[field.id] = value;
          if (field.onChange) field.onChange(value, entity);
          callbacks.onFieldChange(field.id, value);
        };
        checkbox.addEventListener('change', onToggleChange);

        // Дополнительно: если клик по области toggle (не по чекбоксу), переключаем через label
        // <label> уже умеет это делать, поэтому ничего не добавляем

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