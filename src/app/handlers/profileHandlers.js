// src/app/handlers/profileHandlers.js
import { getState, setState } from '@state/store';
import { openProfileSwitchModal } from '@components/Profile/ProfileSwitchModal';
import { renderApp } from '@app/renderers/appRenderer';
import { ensureActiveProfile } from '@app/helpers/profileHelpers';
import { logger } from '@utils/logger';

/**
 * Создаёт обработчик короткого клика по кнопке профиля
 * @param {Function} onSwitchComplete - колбэк, вызываемый после переключения профиля (по умолчанию renderApp)
 * @returns {Function}
 */
export function createProfileClickHandler(onSwitchComplete = renderApp) {
  return function handleProfileClick() {
    const state = getState();
    if (state.editingMode) {
      // Выход из режима редактирования
      const prev = state.previousMode || 'say';
      // Убедимся, что активный профиль существует
      const activeProfile = ensureActiveProfile(state);
      if (!activeProfile) {
        logger.error('Нет активного профиля при выходе из редактирования');
        // Если профилей нет – создаём дефолтный (но это маловероятно)
        setState({ editingMode: false, currentMode: prev, previousMode: null });
        renderApp();
        return;
      }
      setState({
        editingMode: false,
        currentMode: prev,
        previousMode: null,
      });
      // Обновляем приложение
      renderApp();
      return;
    }

    // Открываем модалку выбора профиля
    openProfileSwitchModal((newProfileId) => {
      // После переключения профиля перерендериваем
      renderApp();
      if (onSwitchComplete) onSwitchComplete();
    });
  };
}

/**
 * Создаёт обработчик долгого тапа по кнопке профиля (вход в режим редактирования)
 * @returns {Function}
 */
export function createProfileLongPressHandler() {
  return function handleProfileLongPress() {
    const state = getState();
    if (!state.editingMode) {
      const prev = state.currentMode;
      logger.info('Entering editing mode, previous mode:', prev);
      setState({
        previousMode: prev,
        editingMode: true,
        currentMode: 'profiles',
      });
      renderApp();
    }
  };
}