// src/modes/general/components/DataManagerModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement } from '@utils/dom';
import { exportData, importData, resetAllData } from '../General.controller';

export function openDataManager(onClose) {
  const modal = new Modal({
    title: 'Управление данными',
    body: () => {
      const wrap = createElement('div', { className: 'data-manager', style: 'display:flex; flex-direction:column; gap:12px;' });
      
      const row = createElement('div', { style: 'display:flex; gap:12px; justify-content:center;' });
      const exportBtn = createElement('div', { className: 'category active' }, 'Экспорт');
      exportBtn.addEventListener('click', () => {
        exportData();
        modal.close();
        if (onClose) onClose();
      });
      const importBtn = createElement('div', { className: 'category' }, 'Импорт');
      importBtn.addEventListener('click', () => {
        importData();
        modal.close();
        if (onClose) onClose();
      });
      row.appendChild(exportBtn);
      row.appendChild(importBtn);
      wrap.appendChild(row);

      const resetBtn = createElement('div', { className: 'category category-danger' }, '🗑️ Сбросить все данные');
      resetBtn.addEventListener('click', () => {
        resetAllData();
        modal.close();
        if (onClose) onClose();
      });
      wrap.appendChild(resetBtn);

      return wrap;
    },
    buttons: [
      { label: 'Закрыть', action: () => { modal.close(); if (onClose) onClose(); } }
    ]
  });
  modal.open();
}