// src/modes/general/General.view.js
import { renderMainLayout } from '@components/common/Layout/MainLayout';
import { renderElementGrid } from '@components/common/Grid/GridSimple';
import { createSettingsCard } from '@components/common/Universal/SettingsCard';
import { openVoiceSettings } from '@components/common/Settings/VoiceSettingsModal';
import { openModeManager } from './components/ModeManagerModal';
import { openDataManager } from './components/DataManagerModal';
import { openAboutModal } from './components/AboutModal';
import { getState } from '@state/store';
import {
  toggleFullscreen,
  saveVoiceSettings,
  resetAllData,
  saveSetting,
} from './General.controller';
import { logger } from '@utils/logger';
import { createElement } from '@utils/dom';
import { createIcon } from '@utils/icon';

export function renderGeneral(container) {
  logger.debug('🔄 Rendering General settings');

  if (typeof container._modeCleanup === 'function') {
    container._modeCleanup();
    container._modeCleanup = null;
  }

  const state = getState();
  const globalSettings = state.globalSettings || {};

  const content = createElement('div', { className: 'grid-container' });

  const configs = [
    {
      id: 'fullscreen',
      iconName: 'fullscreen',
      emoji: '🖥️',
      text: 'Полноэкранный режим',
      type: 'click',
      isActive: globalSettings.fullscreen || false,
      onClick: () => {
        const newVal = !globalSettings.fullscreen;
        toggleFullscreen(newVal);
        renderGeneral(container);
      },
    },
    {
      id: 'voice',
      iconName: 'voice',
      emoji: '🔊',
      text: 'Голос',
      type: 'click',
      onClick: () => {
        openVoiceSettings(
          globalSettings.voiceSettings || { rate: 1, pitch: 1, voiceURI: '' },
          (newVoiceSettings) => {
            saveVoiceSettings(newVoiceSettings);
            renderGeneral(container);
          }
        );
      },
    },
    {
      id: 'modes',
      iconName: 'modes',
      emoji: '📋',
      text: 'Режимы',
      type: 'click',
      onClick: () => {
        openModeManager(() => renderGeneral(container));
      },
    },
    {
      id: 'data',
      iconName: 'data',
      emoji: '💾',
      text: 'Данные',
      type: 'click',
      onClick: () => {
        openDataManager(() => renderGeneral(container));
      },
    },
    {
      id: 'about',
      iconName: 'about',
      emoji: 'ℹ️',
      text: 'Об авторе',
      type: 'click',
      onClick: () => {
        openAboutModal();
      },
    },
    {
      id: 'inflection',
      iconName: 'auto-inflect',
      emoji: '📖',
      text: 'Автосклонение',
      type: 'click',
      isActive: globalSettings.autoInflect !== false,
      onClick: () => {
        const newVal = !globalSettings.autoInflect;
        saveSetting('autoInflect', newVal);
        renderGeneral(container);
      },
    },
  ];

  const cards = configs.map((cfg) => {
    const card = createSettingsCard({
      id: cfg.id,
      emoji: '',
      text: cfg.text,
      type: cfg.type,
      value: cfg.value,
      isActive: cfg.isActive,
      onChange: cfg.onChange,
      onClick: cfg.onClick,
    });

    const bg = card.querySelector('.card__bg');
    if (bg) {
      bg.textContent = '';
      bg.appendChild(createIcon(cfg.iconName, { fallback: cfg.emoji, size: 96 }));
    }

    return card;
  });

  renderElementGrid(content, cards);

  renderMainLayout(container, { content, bottomPanel: null });

  container._modeCleanup = () => {
    logger.debug('General mode cleanup done');
  };
}