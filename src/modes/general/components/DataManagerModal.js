// src/modes/general/components/DataManagerModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement } from '@utils/dom';
import { createIcon } from '@utils/icon';
import { toast } from '@utils/toast';
import { logger } from '@utils/logger';
import { exportData, importData, resetAllData } from '../General.controller';
import { checkForUpdate, applyUpdate } from '@services/pwa/updateService';

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

/**
 * Создаёт плитку в стиле общих настроек.
 */
function createDataTile({ id, iconName, fallbackEmoji, text, onClick }) {
  // Создаём структуру карточки как в General.view.js
  const card = createElement('div', {
    className: 'card settings-card-clickable',
    'data-id': id,
    'data-log': `data-tile:${id}`,
  });

  const bg = createElement('div', { className: 'card__bg' });
  bg.appendChild(createIcon(iconName, { fallback: fallbackEmoji, size: 96 }));
  card.appendChild(bg);

  const label = createElement('div', { className: 'card__label' }, text);
  card.appendChild(label);

  card.addEventListener('click', onClick);

  return card;
}

export function openDataManager(onClose) {
  const modal = new Modal({
    title: 'Управление данными',
    body: () => {
      const wrap = createElement('div', { className: 'data-manager' });
      const grid = createElement('div', { className: 'tiles-grid' });

      grid.appendChild(createDataTile({
        id: 'import',
        iconName: 'import',
        fallbackEmoji: '📥',
        text: 'Импорт',
        onClick: () => {
          modal.close();
          if (onClose) onClose();
          importData();
        },
      }));

      grid.appendChild(createDataTile({
        id: 'export',
        iconName: 'export',
        fallbackEmoji: '📤',
        text: 'Экспорт',
        onClick: () => {
          modal.close();
          if (onClose) onClose();
          exportData();
        },
      }));

      grid.appendChild(createDataTile({
        id: 'update',
        iconName: 'refresh',
        fallbackEmoji: '🔄',
        text: 'Обновление',
        onClick: () => {
          handleUpdateCheck();
          // не закрываем модалку — пользователь видит результат
        },
      }));

      grid.appendChild(createDataTile({
        id: 'reset',
        iconName: 'reset',
        fallbackEmoji: '⚠️',
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