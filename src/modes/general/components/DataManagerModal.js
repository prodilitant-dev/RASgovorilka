// src/modes/general/components/DataManagerModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement } from '@utils/dom';
import { iconUrl } from '@utils/icon';
import { toast } from '@utils/toast';
import { logger } from '@utils/logger';
import { exportData, importData, resetAllData } from '../General.controller';
import { checkForUpdate, applyUpdate } from '@services/pwa/updateService';

/**
 * Создаёт плитку с иконкой и названием.
 */
function createTile({ id, icon, emoji, text, onClick }) {
  const tile = createElement('div', {
    className: 'data-tile',
    'data-id': id,
    'data-log': `data-tile:${id}`,
  });

  const bg = createElement('div', { className: 'data-tile__bg' });
  const img = createElement('img', {
    src: iconUrl(icon),
    alt: '',
    className: 'data-tile__icon',
    draggable: 'false',
  });
  img.addEventListener('error', () => {
    img.replaceWith(document.createTextNode(emoji));
  });
  bg.appendChild(img);
  tile.appendChild(bg);

  const label = createElement('div', { className: 'data-tile__label' }, text);
  tile.appendChild(label);

  tile.addEventListener('click', onClick);

  return tile;
}

/**
 * Обработка кнопки «Проверить обновление».
 */
async function handleUpdateCheck() {
  toast('Проверяем обновления…', 'info', 1500);

  const result = await checkForUpdate();
  logger.debug('Update check result:', result);

  switch (result.status) {
    case 'update-available':
      toast('Обновление найдено. Применяем…', 'success');
      setTimeout(() => applyUpdate(), 800);
      break;
    case 'up-to-date':
      toast('У вас последняя версия', 'success');
      break;
    case 'offline':
      toast('Нет подключения к интернету', 'error');
      break;
    case 'no-sw':
      toast('Обновление недоступно в этом режиме', 'info');
      break;
    case 'error':
    default:
      toast('Ошибка при проверке обновлений', 'error');
      break;
  }
}

export function openDataManager(onClose) {
  const modal = new Modal({
    title: 'Управление данными',
    body: () => {
      const wrap = createElement('div', { className: 'data-manager' });
      const grid = createElement('div', { className: 'data-tiles-grid' });

      grid.appendChild(createTile({
        id: 'import',
        icon: 'import',
        emoji: '📥',
        text: 'Импорт',
        onClick: () => {
          modal.close();
          if (onClose) onClose();
          importData();
        },
      }));

      grid.appendChild(createTile({
        id: 'export',
        icon: 'export',
        emoji: '📤',
        text: 'Экспорт',
        onClick: () => {
          modal.close();
          if (onClose) onClose();
          exportData();
        },
      }));

      grid.appendChild(createTile({
        id: 'update',
        icon: 'refresh',
        emoji: '🔄',
        text: 'Обновление',
        onClick: () => {
          handleUpdateCheck();
          // не закрываем модалку — пользователь видит результат и может остаться
        },
      }));

      grid.appendChild(createTile({
        id: 'reset',
        icon: 'reset',
        emoji: '⚠️',
        text: 'Сброс',
        onClick: () => {
          modal.close();
          if (onClose) onClose();
          resetAllData();
        },
      }));

      wrap.appendChild(grid);
      return wrap;
    },
    buttons: [],
    onClose: () => { if (onClose) onClose(); },
  });
  modal.open();
}