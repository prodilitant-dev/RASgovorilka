// src/app/init.js
import { loadInitialState } from '@state/actions';
import { getState } from '@state/store';
import { renderApp } from './render';
import { setContainers, subscribeToStore } from './sync';
import { initKeyboardHandler } from '@utils/keyboardHandler';
import { initFullscreenManager } from '@utils/fullscreen';
import { resetDatabaseIfPending, markForReset } from '@storage/db';
import { logger } from '@utils/logger';
import { toast } from '@utils/toast';
import { initSpeech, ensureVoicesLoaded } from '@utils/speech';
import { applyUISize } from '@utils/uiSize';
import { mountStartScreen, markStartScreenReady } from './startScreen';
import { confirm } from '@utils/dialog';

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

function renderInitError(error) {
  // 1. Убираем старт-оверлей (живёт на body, не в #app)
  const startOverlay = document.querySelector('.start-overlay');
  if (startOverlay) startOverlay.remove();

  // 2. Снимаем inert — иначе кнопки не кликаются
  const app = document.getElementById('app') || document.body;
  app.inert = false;
  app.innerHTML = '';

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 24px; background: #f8f9fa;
    font-family: system-ui, -apple-system, sans-serif;
    color: #1a1a1a; text-align: center; z-index: 99999;
  `;

  const title = document.createElement('h1');
  title.textContent = 'Не удалось загрузить приложение';
  title.style.cssText = 'font-size: 22px; font-weight: 700; margin: 0 0 12px;';

  const text = document.createElement('p');
  text.textContent = 'Это может быть временная ошибка, или данные повреждены.';
  text.style.cssText =
    'font-size: 16px; line-height: 1.5; color: #495057; margin: 0 0 24px; max-width: 420px;';

  const retry = document.createElement('button');
  retry.textContent = 'Попробовать снова';
  retry.style.cssText = `
    padding: 12px 24px; font-size: 16px; font-weight: 600;
    background: #4caf50; color: #fff; border: none; border-radius: 8px;
    cursor: pointer; margin-bottom: 12px; min-width: 220px;
  `;
  retry.addEventListener('click', () => location.reload());

  const reset = document.createElement('button');
  reset.textContent = 'Сбросить данные';
  reset.style.cssText = `
    padding: 12px 24px; font-size: 16px; font-weight: 600;
    background: transparent; color: #c62828; border: 1px solid #c62828;
    border-radius: 8px; cursor: pointer; min-width: 220px;
  `;
  reset.addEventListener('click', async () => {
    const ok = await confirm(
      'Все данные будут удалены без возможности восстановления. Продолжить?'
    );
    if (ok) {
      markForReset();
      location.reload();
    }
  });

  overlay.appendChild(title);
  overlay.appendChild(text);
  overlay.appendChild(retry);
  overlay.appendChild(reset);
  app.appendChild(overlay);

  logger.error('Init error shown to user:', error);
}

export async function initApp() {
  logger.debug('Initializing app');

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
    markStartScreenReady();
  } catch (e) {
    logger.error('App initialization error:', e);
    renderInitError(e);
  }
}
