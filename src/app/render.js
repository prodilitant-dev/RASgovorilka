// src/app/render.js
import { createHeader } from '@components/Header/Header';
import { renderModeBar } from '@components/ModeBar/ModeBar';
import { createMainArea } from '@components/MainArea/MainArea';
import { renderPlaceholder } from '@components/MainArea/renderPlaceholder';
import { renderProfiles } from '@modes/profiles';
import { renderGeneral } from '@modes/general';
import { getState, setState } from '@state/store';
import { logger } from '@utils/logger';
import { createProfileClickHandler, createProfileLongPressHandler } from './handlers';

export function renderApp() {
  logger.debug('🔄 Rendering App');
  const app = document.getElementById('app');
  app.innerHTML = '';
  const state = getState();

  const onProfileClick = createProfileClickHandler();
  const onProfileLongPress = createProfileLongPressHandler();

  const { header, modeBarSlot } = createHeader({
    profileIcon: state.editingMode ? '✕' : '👤',
    onProfileClick,
    onProfileLongPress,
  });
  app.appendChild(header);

  const mainArea = createMainArea();
  app.appendChild(mainArea);

  // Рендерим панель режимов
  renderModeBar(
    modeBarSlot,
    state.currentMode,
    (modeId) => {
      logger.info(`Mode selected: ${modeId}`);
      setState({ currentMode: modeId });
      renderContent(mainArea, modeId);
    },
    state.editingMode,
    state.hiddenModes || [],
    state.modeOrder || []
  );

  // Рендерим контент
  renderContent(mainArea, state.currentMode);

  logger.debug('✅ App rendered');
  return { modeBarSlot, mainArea };
}

export function renderContent(container, modeId) {
  logger.debug(`📱 Switching to mode: ${modeId}`);
  switch (modeId) {
    case 'profiles':
      renderProfiles(container);
      break;
    case 'general':
      renderGeneral(container);
      break;
    default:
      renderPlaceholder(container, modeId);
      break;
  }
}