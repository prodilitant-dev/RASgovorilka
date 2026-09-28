// src/modes/general/components/ImportDialog.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on } from '@utils/dom';
import { EXPORT_COMPONENTS } from '@services/backup/registry';
import { toast } from '@utils/toast';
import { logger } from '@utils/logger';

/**
 * Открывает диалог выбора компонентов и стратегии для импорта
 * @param {Object} importedData - данные из архива
 * @param {Object} manifest - манифест архива
 * @param {Function} onConfirm - (selectedKeys, strategy, selectedCategoryIds) => void
 */
export function openImportDialog(importedData, manifest, onConfirm) {
  const components = Object.keys(manifest.components).map(key => ({
    key,
    label: EXPORT_COMPONENTS[key]?.label || key,
    available: true
  }));

  if (components.length === 0) {
    toast('Архив не содержит данных для импорта', 'error');
    return;
  }

  let selectedKeys = components.map(c => c.key);
  let selectedStrategy = 'add';
  let selectedCategoryIds = [];

  const modal = new Modal({
    title: '📥 Импорт данных',
    body: () => {
      const wrap = createElement('div', { style: 'padding: 8px 0;' });

      const desc = createElement('p', {
        style: 'font-size:14px; color:#555; margin:0 0 12px 0;'
      }, 'Выберите, что импортировать:');
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

        // Если категории — вложенный список
        if (comp.key === 'categories' && importedData.categories) {
          const cats = importedData.categories.categories || [];
          if (cats.length > 0) {
            const container = createElement('div', {
              style: 'margin-left:24px; padding-left:12px; border-left:2px solid #e0e0e0;'
            });
            cats.forEach(cat => {
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

            on(input, 'change', () => {
              container.style.display = input.checked ? 'block' : 'none';
            });
          }
        }
      });

      // Стратегия
      const strategyLabel = createElement('p', {
        style: 'font-size:14px; color:#555; margin:16px 0 8px 0;'
      }, 'Стратегия импорта:');
      wrap.appendChild(strategyLabel);

      const strategyRow = createElement('div', {
        style: 'display:flex; gap:8px; margin:8px 0 12px 0;'
      });
      const addBtn = createElement('div', { className: 'category active' }, '➕ Добавить');
      const updateBtn = createElement('div', { className: 'category active' }, '🔄 Обновить');
      const overwriteBtn = createElement('div', { className: 'category category-danger' }, '⚠️ Перезаписать');
      strategyRow.appendChild(addBtn);
      strategyRow.appendChild(updateBtn);
      strategyRow.appendChild(overwriteBtn);
      wrap.appendChild(strategyRow);

      // Состояние стратегии (подсветка)
      let strategyButtons = [addBtn, updateBtn, overwriteBtn];
      function setActiveStrategy(strategy) {
        selectedStrategy = strategy;
        strategyButtons.forEach(btn => {
          btn.style.outline = btn === document.activeElement ? '2px solid var(--primary)' : 'none';
        });
      }
      setActiveStrategy('add');
      on(addBtn, 'click', () => { setActiveStrategy('add'); });
      on(updateBtn, 'click', () => { setActiveStrategy('update'); });
      on(overwriteBtn, 'click', () => { setActiveStrategy('overwrite'); });

      // Кнопки действий
      const btnRow = createElement('div', {
        style: 'display:flex; gap:8px; justify-content:flex-end; margin-top:16px; padding-top:12px; border-top:1px solid #e0e0e0;'
      });
      const cancelBtn = createElement('div', { className: 'category' }, 'Отмена');
      const importBtn = createElement('div', { className: 'category active' }, '📥 Импортировать');
      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(importBtn);
      wrap.appendChild(btnRow);

      return wrap;
    },
    buttons: [],
    onClose: () => {}
  });

  modal.open();

  // Обработчики кнопок
  const cancelBtn = modal.element.querySelector('.btn-outline');
  if (cancelBtn) {
    on(cancelBtn, 'click', () => modal.close());
  }

  const importBtn = modal.element.querySelector('.btn-primary:last-child');
  if (importBtn) {
    on(importBtn, 'click', () => {
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
      if (onConfirm) onConfirm(keys, selectedStrategy, categoryIds);
    });
  }
}