// src/modes/general/components/InterfaceHubModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement } from '@utils/dom';
import { createIcon } from '@utils/icon';
import { getState } from '@state/store';
import { openModeManager } from './ModeManagerModal';
import { openSentenceBarSettings } from './SentenceBarSettingsModal';
import { openVoiceSettings } from '@components/common/Settings/VoiceSettingsModal';
import { saveSentenceBarPosition, saveVoiceSettings } from '../General.controller';
import { openCategoriesSettings } from './CategoriesSettingsModal';

/**
 * Плитка в стиле DataManagerModal.
 */
function createTile({ id, iconName, fallbackEmoji, text, onClick }) {
  const card = createElement('div', {
    className: 'card settings-card-clickable',
    'data-id': id,
    'data-log': `interface-tile:${id}`,
  });

  const bg = createElement('div', { className: 'card__bg' });
  bg.appendChild(createIcon(iconName, { fallback: fallbackEmoji, size: 96 }));
  card.appendChild(bg);

  const label = createElement('div', { className: 'card__label' }, text);
  card.appendChild(label);

  card.addEventListener('click', onClick);
  return card;
}

/**
 * Хаб настроек интерфейса: Режимы / Панель предложения / Голос.
 * Каждая кнопка открывает свою под-модалку поверх хаба.
 * При закрытии под-модалки возвращаемся к экрану «Общие» (вариант A).
 */
export function openInterfaceHub(onClose) {
  const modal = new Modal({
    title: 'Настройка интерфейса',
    body: () => {
      const wrap = createElement('div', { className: 'data-manager' });
      const grid = createElement('div', { className: 'tiles-grid' });

      grid.appendChild(
        createTile({
          id: 'modes',
          iconName: 'modes',
          fallbackEmoji: '📋',
          text: 'Режимы',
          onClick: () => {
            modal.close();
            if (onClose) onClose();
            openModeManager(() => {});
          },
        })
      );

      grid.appendChild(
        createTile({
          id: 'sentence-bar',
          iconName: 'edit',
          fallbackEmoji: '📐',
          text: 'Панель предложения',
          onClick: () => {
            modal.close();
            if (onClose) onClose();
            const state = getState();
            openSentenceBarSettings(state.globalSettings || {}, (patch) => {
              saveSentenceBarPosition(patch.sentenceBarPosition);
            });
          },
        })
      );

      grid.appendChild(
        createTile({
          id: 'categories',
          iconName: 'categories',
          fallbackEmoji: '🖼',
          text: 'Категории',
          onClick: () => {
            modal.close();
            if (onClose) onClose();
            openCategoriesSettings();
          },
        })
      );

      grid.appendChild(
        createTile({
          id: 'voice',
          iconName: 'voice',
          fallbackEmoji: '🔊',
          text: 'Голос',
          onClick: () => {
            modal.close();
            if (onClose) onClose();
            const state = getState();
            openVoiceSettings(
              state.globalSettings?.voiceSettings || { rate: 1, pitch: 1, voiceURI: '' },
              (newVoiceSettings) => {
                saveVoiceSettings(newVoiceSettings);
              }
            );
          },
        })
      );

      wrap.appendChild(grid);
      return wrap;
    },
    buttons: [],
    onClose: () => {
      if (onClose) onClose();
    },
  });

  modal.open();
}
