// src/modes/general/components/ExportDialog.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on } from '@utils/dom';
import { EXPORT_COMPONENTS } from '@services/backup/registry';
import { getActiveProfile } from '@state/actions';
import { logger } from '@utils/logger';

/**
 * Открывает диалог выбора компонентов для экспорта
 * @param {Function} onConfirm - (selectedKeys, selectedCategoryIds) => void
 */
export function openExportDialog(onConfirm) {
  const profile = getActiveProfile();
  if (!profile) return;

  const components = Object.keys(EXPORT_COMPONENTS).map(key => ({
    key,
    label: EXPORT_COMPONENTS[key].label
  }));

  let selectedKeys = components.map(c => c.key);
  let selectedCategoryIds = profile.categories.map(c => c.id);
  let categoriesVisible = true;

  const modal = new Modal({
    title: '📤 Экспорт данных',
    body: () => {
      const wrap = createElement('div', { style: 'padding: 8px 0;' });

      const desc = createElement('p', {
        style: 'font-size:14px; color:#555; margin:0 0 12px 0;'
      }, 'Выберите, что экспортировать:');
      wrap.appendChild(desc);

      // Список компонентов
      components.forEach(comp => {
        const chip = createElement('div', {
          className: 'mode-order-chip',
          style: 'display:flex; justify-content:space-between; align-items:center; padding:8px 12px;'
        });
        const label = createElement('span', { style: 'flex:1;' }, comp.label);

        const toggle = createElement('label', { className: 'toggle-switch' });
        const input = createElement('input', { type: 'checkbox', checked: true });
        input.dataset.key = comp.key;
        const slider = createElement('span', { className: 'slider' });
        toggle.appendChild(input);
        toggle.appendChild(slider);

        chip.appendChild(label);
        chip.appendChild(toggle);
        wrap.appendChild(chip);

        // Если это категории, добавляем вложенный список
        if (comp.key === 'categories' && profile.categories.length > 0) {
          const container = createElement('div', {
            style: 'margin-left:24px; padding-left:12px; border-left:2px solid #e0e0e0;'
          });
          profile.categories.forEach(cat => {
            const row = createElement('div', {
              className: 'mode-order-chip',
              style: 'display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:none;'
            });
            const catLabel = createElement('span', { style: 'flex:1;' }, cat.name);
            const catToggle = createElement('label', { className: 'toggle-switch' });
            const catInput = createElement('input', { type: 'checkbox', checked: true });
            catInput.dataset.catid = cat.id;
            const catSlider = createElement('span', { className: 'slider' });
            catToggle.appendChild(catInput);
            catToggle.appendChild(catSlider);
            row.appendChild(catLabel);
            row.appendChild(catToggle);
            container.appendChild(row);
          });
          wrap.appendChild(container);

          // Обработчик показа/скрытия категорий
          on(input, 'change', () => {
            container.style.display = input.checked ? 'block' : 'none';
          });
        }
      });

      // Кнопки
      const btnRow = createElement('div', {
        style: 'display:flex; gap:8px; justify-content:flex-end; margin-top:16px; padding-top:12px; border-top:1px solid #e0e0e0;'
      });
      const cancelBtn = createElement('button', { className: 'btn-outline' }, 'Отмена');
      const confirmBtn = createElement('button', { className: 'btn-primary' }, '📦 Экспортировать');

      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(confirmBtn);
      wrap.appendChild(btnRow);

      return wrap;
    },
    buttons: [],
    onClose: () => {
      // Если закрыли по крестику — ничего не делаем
    }
  });

  modal.open();

  // Обработчики кнопок
  const cancelBtn = modal.element.querySelector('.btn-outline');
  if (cancelBtn) {
    on(cancelBtn, 'click', () => modal.close());
  }

  const confirmBtn = modal.element.querySelector('.btn-primary');
  if (confirmBtn) {
    on(confirmBtn, 'click', () => {
      // Собираем выбранные компоненты
      const checkedComponents = modal.element.querySelectorAll('.toggle-switch input[type="checkbox"]');
      const keys = [];
      checkedComponents.forEach(inp => {
        if (inp.checked && inp.dataset.key) keys.push(inp.dataset.key);
      });
      if (keys.length === 0) {
        toast('Выберите хотя бы один компонент', 'error');
        return;
      }

      // Собираем выбранные категории
      let categoryIds = null;
      if (keys.includes('categories')) {
        const checkedCats = modal.element.querySelectorAll('.toggle-switch input[data-catid]');
        const ids = [];
        checkedCats.forEach(inp => {
          if (inp.checked && inp.dataset.catid) ids.push(inp.dataset.catid);
        });
        if (ids.length === 0) {
          toast('Выберите хотя бы одну категорию', 'error');
          return;
        }
        categoryIds = ids;
      }

      modal.close();
      if (onConfirm) onConfirm(keys, categoryIds);
    });
  }
}