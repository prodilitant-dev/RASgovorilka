// src/app/init.js
import { loadInitialState } from '@state/actions';
import { renderApp } from './render';
import { setContainers, subscribeToStore } from './sync';
import { initKeyboardHandler } from '@utils/keyboardHandler';
import { logger } from '@utils/logger';

export async function initApp() {
  logger.debug('Initializing app');
  initKeyboardHandler();

  await loadInitialState();
  const { modeBarSlot, mainArea } = renderApp();
  setContainers(modeBarSlot, mainArea);

  subscribeToStore();
  logger.debug('App initialized');
}