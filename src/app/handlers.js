// src/app/handlers.js
import { setState, getState } from '@state/store';
import { logger } from '@utils/logger';
import { renderApp } from './render'; // чтобы перерендерить приложение при выходе из редактирования

export function createProfileClickHandler() {
  return () => {
    const state = getState();
    if (state.editingMode) {
      const prev = state.previousMode || 'say';
      setState({ editingMode: false, currentMode: prev, previousMode: null });
      renderApp(); // перерендерим всё приложение
      return;
    }
    logger.info('Open profile selection modal');
    // TODO: модалка выбора профиля
  };
}

export function createProfileLongPressHandler() {
  return () => {
    const state = getState();
    if (!state.editingMode) {
      const prev = state.currentMode;
      logger.info('Entering editing mode, previous mode:', prev);
      setState({ previousMode: prev, editingMode: true, currentMode: 'profiles' });
      renderApp();
    }
  };
}