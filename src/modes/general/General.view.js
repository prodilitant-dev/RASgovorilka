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
} from './General.controller';
import { logger } from '@utils/logger';
import { createElement } from '@utils/dom';

export function renderGeneral(container) {
  logger.debug('🔄 Rendering General settings');
  const state = getState();
  const globalSettings = state.globalSettings || {};

  // Создаём контент: сетка с карточками настроек
  const content = createElement('div', { className: 'grid-container' });

  const configs = [
    {
      id: 'fullscreen',
      emoji: '🖥️',
      text: 'Полноэкранный режим',
      type: 'click',
      isActive: globalSettings.fullscreen || false,
      onClick: () => {
        const newVal = !globalSettings.fullscreen;
        logger.info(`Toggle fullscreen: ${newVal}`);
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
        logger.info('Opening voice settings');
        openVoiceSettings(
          globalSettings.voiceSettings || { rate: 1, pitch: 1, voiceURI: '' },
          (newVoiceSettings) => {
            logger.info('Voice settings saved', newVoiceSettings);
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
        logger.info('Opening mode manager');
        openModeManager(() => renderGeneral(container));
      },
    },
    {
      id: 'data',
      emoji: '💾',
      text: 'Данные',
      type: 'click',
      onClick: () => {
        logger.info('Opening data manager');
        openDataManager(() => renderGeneral(container));
      },
    },
    {
      id: 'reset',
      emoji: '🗑️',
      text: 'Сброс данных',
      type: 'click',
      onClick: () => {
        logger.info('Reset data triggered');
        resetAllData();
      },
    },
    {
      id: 'about',
      emoji: 'ℹ️',
      text: 'Об авторе',
      type: 'click',
      onClick: () => {
        logger.info('Opening about modal');
        openAboutModal();
      },
    },
  ];

  const cards = configs.map(cfg => createSettingsCard(cfg));
  renderElementGrid(content, cards);

  // Оборачиваем контент в единую структуру main-area (без нижней панели)
  renderMainLayout(container, { content, bottomPanel: null });
  logger.debug('✅ General rendered');
}