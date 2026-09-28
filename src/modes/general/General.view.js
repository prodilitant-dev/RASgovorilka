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

export function renderGeneral(container) {
  logger.debug('🔄 Rendering General settings');
  const state = getState();
  const globalSettings = state.globalSettings || {};

  const content = createElement('div', { className: 'grid-container' });

  // Настройки, которые открывают модалку с тоглом
  const configs = [
    {
      id: 'fullscreen',
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
      emoji: '📋',
      text: 'Режимы',
      type: 'click',
      onClick: () => {
        openModeManager(() => renderGeneral(container));
      },
    },
    {
      id: 'data',
      emoji: '💾',
      text: 'Данные',
      type: 'click',
      onClick: () => {
        openDataManager(() => renderGeneral(container));
      },
    },
    {
      id: 'about',
      emoji: 'ℹ️',
      text: 'Об авторе',
      type: 'click',
      onClick: () => {
        openAboutModal();
      },
    },
    // Новая карточка: Склонения
    {
      id: 'inflection',
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

  const cards = configs.map(cfg => createSettingsCard(cfg));
  renderElementGrid(content, cards);

  renderMainLayout(container, { content, bottomPanel: null });
  logger.debug('✅ General rendered');
}