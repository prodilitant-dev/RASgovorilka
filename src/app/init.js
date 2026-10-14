// src/app/init.js
import { loadInitialState } from '@state/actions';
import { renderApp } from './render';
import { setContainers, subscribeToStore } from './sync';
import { initKeyboardHandler } from '@utils/keyboardHandler';
import { maybeEnableFullscreenOnFirstInteraction } from '@utils/fullscreen';
import { resetDatabaseIfPending } from '@storage/db';
import { logger } from '@utils/logger';
import { toast } from '@utils/toast';

/**
 * Обработка открытия файла .rasbackup через файловый менеджер.
 * Работает только в установленной PWA (Chrome/Edge, Android/Desktop).
 *
 * JSZip и модуль импорта подгружаются динамически — только когда
 * реально открыли файл. Это экономит ~30 KB gzip в стартовом бандле.
 */
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

/**
 * Регистрирует обработчик launchQueue — срабатывает, когда
 * пользователь открывает .rasbackup через файловый менеджер.
 */
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

  try {
    await resetDatabaseIfPending();
  } catch (e) {
    logger.error('resetDatabaseIfPending error:', e);
  }

  initKeyboardHandler();
  setupFileHandler();

  await loadInitialState();

  maybeEnableFullscreenOnFirstInteraction();

  const { modeBarSlot, mainArea } = renderApp();
  setContainers(modeBarSlot, mainArea);

  subscribeToStore();
  logger.debug('App initialized');
}
