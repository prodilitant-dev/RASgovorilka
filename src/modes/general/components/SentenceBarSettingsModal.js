// src/modes/general/components/SentenceBarSettingsModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on } from '@utils/dom';

/**
 * Модалка выбора положения панели предложения.
 *
 * @param {Object} currentSettings - текущие globalSettings
 * @param {(patch: Object) => void} onSave - вызывается с новыми значениями
 */
export function openSentenceBarSettings(currentSettings, onSave) {
  const working = {
    sentenceBarPosition: currentSettings?.sentenceBarPosition || 'bottom',
  };

  const options = [
    { value: 'bottom', text: 'Внизу (по умолчанию)', hint: 'Привычное расположение' },
    {
      value: 'top',
      text: 'Вверху',
      hint: 'Ребёнок не заденет системный жест снизу и не свернёт приложение',
    },
  ];

  const buttons = [];
  const group = createElement('div', { className: 'interface-settings__group' });

  options.forEach((opt) => {
    const btn = createElement('button', {
      type: 'button',
      className: `interface-settings__option${
        working.sentenceBarPosition === opt.value ? ' active' : ''
      }`,
      'data-value': opt.value,
    });

    const title = createElement('div', { className: 'interface-settings__option-title' }, opt.text);
    const hint = createElement('div', { className: 'interface-settings__option-hint' }, opt.hint);

    btn.appendChild(title);
    btn.appendChild(hint);

    on(btn, 'click', () => {
      working.sentenceBarPosition = opt.value;
      buttons.forEach((b) => {
        b.classList.toggle('active', b.dataset.value === opt.value);
      });
    });

    buttons.push(btn);
    group.appendChild(btn);
  });

  const root = createElement('div', { className: 'interface-settings' });
  const label = createElement(
    'div',
    { className: 'interface-settings__label' },
    'Панель предложения'
  );
  root.appendChild(label);
  root.appendChild(group);

  const modal = new Modal({
    title: 'Панель предложения',
    body: () => root,
    buttons: [
      {
        label: 'Отмена',
        action: () => modal.close(),
      },
      {
        label: 'Сохранить',
        primary: true,
        action: () => {
          onSave(working);
          modal.close();
        },
      },
    ],
  });

  modal.open();
}
