// src/modes/general/components/CategoriesSettingsModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on } from '@utils/dom';
import { getState } from '@state/store';
import { saveSetting } from '../General.controller';

/**
 * Модалка настроек отображения категорий.
 * Пока — один тумблер «Показывать картинки».
 */
export function openCategoriesSettings() {
  const state = getState();
  let value = state.globalSettings?.categoriesShowImages !== false;

  const root = createElement('div', { className: 'interface-settings' });
  const row = createElement('div', {
    className: 'interface-settings__toggle-row',
    style: 'display: flex; align-items: center; justify-content: space-between; gap: 12px;',
  });

  const label = createElement(
    'div',
    { className: 'interface-settings__label', style: 'margin: 0;' },
    'Показывать картинки категорий'
  );

  const toggleWrap = createElement('label', { className: 'toggle-switch' });
  const checkbox = createElement('input', { type: 'checkbox', checked: value });
  const slider = createElement('span', { className: 'slider' });
  toggleWrap.appendChild(checkbox);
  toggleWrap.appendChild(slider);

  on(checkbox, 'change', () => {
    value = checkbox.checked;
  });

  row.appendChild(label);
  row.appendChild(toggleWrap);
  root.appendChild(row);

  const modal = new Modal({
    title: 'Категории',
    body: () => root,
    buttons: [
      { label: 'Отмена', action: () => modal.close() },
      {
        label: 'Сохранить',
        primary: true,
        action: () => {
          saveSetting('categoriesShowImages', value);
          modal.close();
        },
      },
    ],
  });

  modal.open();
}
