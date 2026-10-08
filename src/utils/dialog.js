// src/utils/dialog.js
import { Modal } from '@components/common/Modal/Modal';

/**
 * Модалка подтверждения.
 * Возвращает Promise<boolean>: true — пользователь нажал «Да», false — «Отмена».
 *
 * @param {string} message - текст вопроса
 * @param {string} [title=''] - заголовок модалки
 * @returns {Promise<boolean>}
 */
export function confirm(message, title = '') {
  return new Promise((resolve) => {
    const modal = new Modal({
      title,
      body: `<p>${message}</p>`,
      buttons: [
        {
          label: 'Отмена',
          action: () => {
            modal.close();
            resolve(false);
          },
        },
        {
          label: 'Да',
          primary: true,
          action: () => {
            modal.close();
            resolve(true);
          },
        },
      ],
    });
    modal.open();
  });
}