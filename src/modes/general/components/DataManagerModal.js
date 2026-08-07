import { Modal } from '@components/common/Modal/Modal';
import { createElement } from '@utils/dom';
import { exportData, importData } from '../General.controller';

export function openDataManager(onClose) {
  const modal = new Modal({
    title: 'Управление данными',
    body: () => {
      const wrap = createElement('div', { className: 'data-manager', style: 'display:flex; gap:12px; justify-content:center;' });
      const exportBtn = createElement('button', { className: 'btn btn-primary' }, 'Экспорт');
      exportBtn.addEventListener('click', () => {
        exportData();
        modal.close();
        if (onClose) onClose();
      });
      const importBtn = createElement('button', { className: 'btn btn-secondary' }, 'Импорт');
      importBtn.addEventListener('click', () => {
        importData();
        modal.close();
        if (onClose) onClose();
      });
      wrap.appendChild(exportBtn);
      wrap.appendChild(importBtn);
      return wrap;
    },
    buttons: [
      { label: 'Закрыть', action: () => { modal.close(); if (onClose) onClose(); } }
    ]
  });
  modal.open();
}