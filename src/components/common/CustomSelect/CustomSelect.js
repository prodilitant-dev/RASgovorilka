// src/components/common/CustomSelect/CustomSelect.js
import { createElement, clear } from '@utils/dom';

export function createCustomSelect({
  options,         // массив { value, label }
  value,           // текущее значение
  onChange,        // (value) => void
  placeholder = 'Выберите...',
  className = '',
}) {
  let isOpen = false;
  let selectedValue = value || '';
  const container = createElement('div', { className: `custom-select ${className}` });

  // Кнопка для отображения выбранного значения
  const button = createElement('button', {
    className: 'custom-select-button',
    'data-log': 'custom-select-toggle',
  }, getSelectedLabel() || placeholder);
  container.appendChild(button);

  // Выпадающий список
  const dropdown = createElement('div', { className: 'custom-select-dropdown' });
  container.appendChild(dropdown);

  function renderDropdown() {
    clear(dropdown);
    options.forEach(opt => {
      const item = createElement('div', {
        className: `custom-select-item ${opt.value === selectedValue ? 'selected' : ''}`,
        'data-value': opt.value,
      }, opt.label);
      item.addEventListener('click', () => {
        selectValue(opt.value);
        closeDropdown();
      });
      dropdown.appendChild(item);
    });
  }

  function selectValue(val) {
    selectedValue = val;
    button.textContent = getSelectedLabel() || placeholder;
    if (onChange) onChange(val);
    renderDropdown(); // обновляем класс selected
  }

  function getSelectedLabel() {
    const found = options.find(o => o.value === selectedValue);
    return found ? found.label : null;
  }

  function openDropdown() {
    if (isOpen) return;
    isOpen = true;
    renderDropdown();
    container.classList.add('open');
    // Закрытие при клике вне
    document.addEventListener('click', handleOutsideClick);
  }

  function closeDropdown() {
    if (!isOpen) return;
    isOpen = false;
    container.classList.remove('open');
    document.removeEventListener('click', handleOutsideClick);
  }

  function toggleDropdown() {
    isOpen ? closeDropdown() : openDropdown();
  }

  function handleOutsideClick(e) {
    if (!container.contains(e.target)) {
      closeDropdown();
    }
  }

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Инициализация
  renderDropdown();

  return {
    element: container,
    getValue: () => selectedValue,
    setValue: (val) => selectValue(val),
    destroy: () => {
      document.removeEventListener('click', handleOutsideClick);
    },
  };
}