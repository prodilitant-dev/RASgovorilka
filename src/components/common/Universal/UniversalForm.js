import { createElement } from '@utils/dom';
import { Modal } from '../Modal/Modal';

/**
 * Создаёт универсальную форму внутри модалки.
 * @param {Object} config
 * @param {Array} config.fields - массив полей
 * @param {string} config.title - заголовок модалки
 * @param {Function} config.onSubmit - (formData) => void
 * @param {Function} config.onCancel - () => void
 * @param {Array} config.customButtons - массив кастомных кнопок: { label, action: (close) => void }
 * @param {boolean} config.modal - true (по умолчанию) для отображения в модалке
 * @returns {Modal} экземпляр модалки
 */
export function buildUniversalForm(config) {
  const { fields, title = 'Форма', onSubmit, onCancel, modal = true, customButtons = [] } = config;

  // Создаём элементы полей
  const fieldElements = {};
  const form = createElement('div', { className: 'universal-form' });

  fields.forEach(field => {
    const row = createElement('div', { className: 'form-row' });
    const label = createElement('label', {}, field.label);
    let input;

    switch (field.type) {
      case 'text':
      case 'number':
      case 'password':
        input = createElement('input', {
          type: field.type,
          value: field.value || '',
          placeholder: field.placeholder || '',
          ...(field.min !== undefined && { min: field.min }),
          ...(field.max !== undefined && { max: field.max }),
        });
        if (field.onChange) {
          input.addEventListener('input', (e) => field.onChange(e.target.value, field.key));
        }
        break;

      case 'select':
        input = createElement('select', {});
        if (field.options) {
          field.options.forEach(opt => {
            const option = createElement('option', { value: opt.value }, opt.label);
            if (opt.value === field.value) option.selected = true;
            input.appendChild(option);
          });
        }
        if (field.onChange) {
          input.addEventListener('change', (e) => field.onChange(e.target.value, field.key));
        }
        break;

      case 'toggle':
        input = createElement('label', { className: 'toggle-switch' });
        const checkbox = createElement('input', { type: 'checkbox', checked: field.value || false });
        const slider = createElement('span', { className: 'slider' });
        input.appendChild(checkbox);
        input.appendChild(slider);
        if (field.onChange) {
          checkbox.addEventListener('change', (e) => field.onChange(e.target.checked, field.key));
        }
        break;

      case 'range':
        input = createElement('input', {
          type: 'range',
          min: field.min || 0,
          max: field.max || 100,
          step: field.step || 1,
          value: field.value || 0,
        });
        const valueDisplay = createElement('span', {}, field.value || 0);
        input.addEventListener('input', (e) => {
          valueDisplay.textContent = e.target.value;
          if (field.onChange) field.onChange(parseFloat(e.target.value), field.key);
        });
        row.appendChild(input);
        row.appendChild(valueDisplay);
        break;

      case 'image':
        // Загрузка изображения – упрощённо
        input = createElement('div', { className: 'tile-bg' });
        input.textContent = field.value?.emoji || '📄';
        input.addEventListener('click', () => {
          const fileInput = createElement('input', { type: 'file', accept: 'image/*' });
          fileInput.click();
          fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0];
            if (file) {
              const id = Date.now().toString(36);
              // Здесь можно сохранить изображение и обновить поле
              if (field.onChange) field.onChange({ imageId: id, file }, field.key);
            }
          });
        });
        break;

      default:
        input = createElement('div', {}, 'Неизвестный тип поля');
    }

    fieldElements[field.key] = input;
    row.appendChild(label);
    row.appendChild(input);
    form.appendChild(row);
  });

  // Если форма не в модалке, просто возвращаем форму
  if (!modal) {
    return form;
  }

  // Создаём модалку
  const modalInstance = new Modal({
    title,
    body: () => form,
    buttons: (() => {
      const buttons = [];

      // Кастомные кнопки (с возможностью закрытия)
      customButtons.forEach(btn => {
        buttons.push({
          label: btn.label,
          action: () => {
            if (btn.action) {
              btn.action(() => modalInstance.close());
            }
          }
        });
      });

      // Кнопка "Отмена"
      buttons.push({
        label: 'Отмена',
        action: () => {
          modalInstance.close();
          if (onCancel) onCancel();
        }
      });

      // Кнопка "Сохранить" (primary)
      buttons.push({
        label: 'Сохранить',
        primary: true,
        action: () => {
          const formData = {};
          fields.forEach(field => {
            const el = fieldElements[field.key];
            if (!el) return;
            if (field.type === 'toggle') {
              formData[field.key] = el.querySelector('input').checked;
            } else if (field.type === 'range') {
              formData[field.key] = parseFloat(el.value);
            } else if (field.type === 'select') {
              formData[field.key] = el.value;
            } else if (field.type === 'text' || field.type === 'number' || field.type === 'password') {
              formData[field.key] = el.value;
            } else if (field.type === 'image') {
              // пока пропускаем
            }
          });
          modalInstance.close();
          if (onSubmit) onSubmit(formData);
        }
      });

      return buttons;
    })()
  });

  return modalInstance;
}