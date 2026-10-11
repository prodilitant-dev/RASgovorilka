// src/app/init.js
import { loadInitialState } from '@state/actions';
import { renderApp } from './render';
import { setContainers, subscribeToStore } from './sync';
import { initKeyboardHandler } from '@utils/keyboardHandler';
import { maybeEnableFullscreenOnFirstInteraction } from '@utils/fullscreen';
import { resetDatabaseIfPending } from '@storage/db';
import { logger } from '@utils/logger';

export async function initApp() {
  logger.debug('Initializing app');

  // Проверяем флаг сброса ДО первого getDB() — иначе будет blocked
  try {
    await resetDatabaseIfPending();
  } catch (e) {
    logger.error('resetDatabaseIfPending error:', e);
  }

  initKeyboardHandler();

  await loadInitialState();

  // Если в настройках включён fullscreen — ждём первого касания
  maybeEnableFullscreenOnFirstInteraction();

  const { modeBarSlot, mainArea } = renderApp();
  setContainers(modeBarSlot, mainArea);

  subscribeToStore();
  logger.debug('App initialized');
}