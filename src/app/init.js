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

    initKeyboardHandler();
    initSpeech();
    setupFileHandler();

    // Не блокируем старт — голоса подгрузятся в фоне,
    // если getVoices() изначально пуст.
    ensureVoicesLoaded().catch(() => {});

    await loadInitialState();

    // Применяем размер интерфейса (small/medium/large) до рендера,
    // чтобы не было «мигания» при переключении.
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
