// src/app/renderers/appRenderer.js
import { createHeader } from '@components/Header/Header';
import { renderModeBar } from '@components/ModeBar/ModeBar';
import { createMainArea } from '@components/MainArea/MainArea';
import { getState, setState } from '@state/store';
import { getActiveProfile } from '@state/actions';
import { renderContent } from './contentRenderer';
import { getProfileIcon, ensureActiveProfile } from '@app/helpers/profileHelpers';
import { createProfileClickHandler, createProfileLongPressHandler } from '@app/handlers/profileHandlers';
import { logger } from '@utils/logger';

/**
 * Основная функция рендера приложения
 * @returns {Object} { modeBarSlot, mainArea }
 */
export function renderApp() {
  logger.debug('🔄 Rendering App');
  const app = document.getElementById('app');
  app.innerHTML = '';

  const state = getState();

  // Убеждаемся, что активный профиль существует
  const activeProfile = ensureActiveProfile(state);
  if (!activeProfile) {
    // Если профилей нет – выходим (это не должно произойти, т.к. loadInitialState создаёт дефолтный)
    logger.error('Нет ни одного профиля! Приложение не может работать.');
    app.innerHTML = '<div style="padding:20px;text-align:center;">Ошибка: нет профилей. Перезагрузите приложение.</div>';
    return;
  }

  // Получаем иконку для кнопки профиля
  const profileIcon = getProfileIcon(state);

  // Создаём обработчики кликов
  const handleProfileClick = createProfileClickHandler();
  const handleProfileLongPress = createProfileLongPressHandler();

  // Создаём шапку
  const { header, modeBarSlot } = createHeader({
    profileIcon,
    onProfileClick: handleProfileClick,
    onProfileLongPress: handleProfileLongPress,
  });
  app.appendChild(header);

  // Создаём основную область
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

  // Рендерим контент текущего режима
  renderContent(mainArea, state.currentMode);

  logger.debug('✅ App rendered');
  return { modeBarSlot, mainArea };
}