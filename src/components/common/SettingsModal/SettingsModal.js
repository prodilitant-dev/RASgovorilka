// src/components/common/SettingsModal/SettingsModal.js
import { Modal } from '../Modal/Modal';
import { createElement } from '@utils/dom';
import { logger } from '@utils/logger';

export function renderSettingsModal({
  profile,
  currentSettings,
  fields,
  onSave,
  onCancel,
  title = 'Настройки'
}) {
  const modal = new Modal({
    title,
    body: () => {
      const wrap = createElement('div', { className: 'settings-form' });
      fields.forEach(field => {
        // Реализация по аналогии с тем, что мы обсуждали
        // Здесь будет генерация полей в зависимости от типа
        // Для краткости используем упрощённую версию
        const row = createElement('div', { className: 'form-row' });
        const label = createElement('label', {}, field.label);
        let input;
        if (field.type === 'checkbox') {
          const container = createElement('div', { className: 'checkbox-group' });
          const options = typeof field.options === 'function' ? field.options(profile) : field.options;
          options.forEach(opt => {
            const cbWrap = createElement('label', { className: 'toggle-switch' });
            const cb = createElement('input', {
              type: 'checkbox',
              value: opt.value,
              checked: currentSettings[field.key]?.includes(opt.value) || false,
            });
            const slider = createElement('span', { className: 'slider' });
            cbWrap.appendChild(cb);
            cbWrap.appendChild(slider);
            const labelText = createElement('span', {}, opt.label);
            const item = createElement('div', { className: 'checkbox-item' });
            item.appendChild(cbWrap);
            item.appendChild(labelText);
            container.appendChild(item);
          });
          input = container;
        } else if (field.type === 'range') {
          input = createElement('input', {
            type: 'range',
            min: field.min || 0,
            max: field.max || 100,
            step: field.step || 1,
            value: currentSettings[field.key] ?? field.default ?? 0,
          });
          const valueDisplay = createElement('span', {}, input.value);
          input.addEventListener('input', () => {
            valueDisplay.textContent = input.value;
          });
          row.appendChild(input);
          row.appendChild(valueDisplay);
        } else if (field.type === 'select') {
          input = createElement('select', {});
          const options = typeof field.options === 'function' ? field.options(profile) : field.options;
          options.forEach(opt => {
            const option = createElement('option', { value: opt.value }, opt.label);
            if (opt.value === currentSettings[field.key]) option.selected = true;
            input.appendChild(option);
          });
        }
        row.appendChild(label);
        if (input) row.appendChild(input);
        wrap.appendChild(row);
      });
      return wrap;
    },
    buttons: [
      { label: 'Отмена', action: () => { modal.close(); if (onCancel) onCancel(); } },
      {
        label: 'Сохранить',
        primary: true,
        action: () => {
          const body = modal.element.querySelector('.modal-body');
          const newSettings = { ...currentSettings };
          fields.forEach(field => {
            if (field.type === 'checkbox') {
              const checkboxes = body.querySelectorAll(`input[type="checkbox"]`);
              const values = [];
              checkboxes.forEach(cb => cb.checked && values.push(cb.value));
              newSettings[field.key] = values;
            } else if (field.type === 'range') {
              const input = body.querySelector(`input[type="range"]`);
              newSettings[field.key] = parseFloat(input.value);
            } else if (field.type === 'select') {
              const select = body.querySelector('select');
              newSettings[field.key] = select.value;
            }
          });
          modal.close();
          onSave(newSettings);
        }
      }
    ]
  });
  modal.open();
}