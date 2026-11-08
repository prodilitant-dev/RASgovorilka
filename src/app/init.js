// src/app/init.js
import { loadInitialState } from '@state/actions';
import { getState } from '@state/store';
import { renderApp } from './render';
import { setContainers, subscribeToStore } from './sync';
import { initKeyboardHandler } from '@utils/keyboardHandler';
import { initFullscreenManager } from '@utils/fullscreen';
import { resetDatabaseIfPending } from '@storage/db';
import { logger } from '@utils/logger';
import { toast } from '@utils/toast';
import { initSpeech, ensureVoicesLoaded } from '@utils/speech';
import { applyUISize } from '@utils/uiSize';
import { mountStartScreen, markStartScreenReady } from './startScreen';

async function handleLaunchFile(file) {
  try {
    const { importFromZip } = await import('@services/backup/import');
    await importFromZip(file);
    logger.info('File handler: импорт из .rasbackup завершён');
  } catch (e) {
    logger.error('File handler error:', e);
    toast('Не удалось импортировать файл', 'error');
  }
}

function setupFileHandler() {
  if (!('launchQueue' in window)) {
    logger.debug('File Handling API не поддерживается');
    return;
  }

  window.launchQueue.setConsumer(async (launchParams) => {
    if (!launchParams.files || launchParams.files.length === 0) return;
    const fileHandle = launchParams.files[0];
    try {
      const file = await fileHandle.getFile();
      await handleLaunchFile(file);
    } catch (e) {
      logger.error('launchQueue: не удалось получить файл', e);
    }
  });

  logger.debug('File handler инициализирован');
}

export async function initApp() {
  logger.debug('Initializing app');

  // Монтируем старт-экран ПЕРВЫМ — иначе на медленных устройствах
  // пользователь видит пустой серый экран, пока идёт loadInitialState().
  // Прогрев синтеза речи выполняется внутри обработчика кнопки «Начать»
  // (явный user gesture — обязательное условие на Android Chrome).
  mountStartScreen();

  try {
    try {
      await resetDatabaseIfPending();
    } catch (e) {
      logger.error('resetDatabaseIfPending error:', e);
    }

    initSpeech();
    setupFileHandler();
    ensureVoicesLoaded().catch(() => {});

    await loadInitialState();

    initKeyboardHandler();

    const state = getState();
    applyUISize(state.globalSettings?.uiSize || 'small');

    initFullscreenManager();

    const { modeBarSlot, mainArea } = renderApp();
    setContainers(modeBarSlot, mainArea);

    subscribeToStore();
    logger.debug('App initialized');
  } catch (e) {
    logger.error('App initialization error:', e);
  } finally {
    // Даже при ошибке даём пользователю нажать «Начать» —
    // лучше увидеть частично отрисованное приложение, чем вечный оверлей.
    markStartScreenReady();
  }
}
