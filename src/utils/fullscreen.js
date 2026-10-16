// src/utils/fullscreen.js
import { getState } from '@state/store';
import { logger } from './logger';

let initialized = false;
let touchHandlerAttached = false;
let pendingTryFs = null;

function isFlagEnabled() {
  const state = getState();
  return state.globalSettings?.fullscreen === true;
}

function isInFullscreen() {
  return !!document.fullscreenElement;
}

function requestFs() {
  const el = document.documentElement;
  if (!el.requestFullscreen) return Promise.resolve(false);
  return el.requestFullscreen().then(
    () => true,
    (err) => {
      logger.warn('Fullscreen request failed:', err);
      return false;
    }
  );
}

function attachTouchHandler() {
  if (touchHandlerAttached) return;
  if (!isFlagEnabled()) return;
  if (isInFullscreen()) return;

  touchHandlerAttached = true;

  const tryFs = async () => {
    // Снимаем обработчик сразу, чтобы не дублировать
    detachTouchHandler();

    if (!isFlagEnabled()) return;
    if (isInFullscreen()) return;

    await requestFs();
    // После попытки — syncState сам разрулит:
    // если получилось — обработчик не нужен;
    // если не получилось — syncState поставит снова.
  };

  pendingTryFs = tryFs;
  document.addEventListener('pointerdown', tryFs, true);
  document.addEventListener('touchstart', tryFs, true);
  document.addEventListener('click', tryFs, true);

  logger.debug('Fullscreen: waiting for user interaction');
}

function detachTouchHandler() {
  if (!touchHandlerAttached || !pendingTryFs) {
    touchHandlerAttached = false;
    pendingTryFs = null;
    return;
  }
  document.removeEventListener('pointerdown', pendingTryFs, true);
  document.removeEventListener('touchstart', pendingTryFs, true);
  document.removeEventListener('click', pendingTryFs, true);
  touchHandlerAttached = false;
  pendingTryFs = null;
}

/**
 * Приводит состояние обработчиков в соответствие с флагом и текущим режимом.
 * Вызывается:
 *  - при старте приложения
 *  - при fullscreenchange (пользователь вышел / вошёл)
 *  - при visibilitychange (вернулся в приложение)
 *  - при переключении флага в настройках
 */
function syncState() {
  const enabled = isFlagEnabled();
  const inFs = isInFullscreen();

  if (!enabled) {
    detachTouchHandler();
    return;
  }

  if (inFs) {
    detachTouchHandler();
    return;
  }

  // Флаг включён, но мы не в fullscreen — нужен обработчик касания
  attachTouchHandler();
}

/**
 * Инициализация менеджера полноэкранного режима.
 * Вызывается один раз при старте приложения.
 */
export function initFullscreenManager() {
  if (initialized) return;
  initialized = true;

  document.addEventListener('fullscreenchange', () => {
    logger.debug('Fullscreen changed:', isInFullscreen() ? 'entered' : 'exited');
    syncState();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      logger.debug('Visibility: app became visible, syncing fullscreen');
      syncState();
    }
  });

  // Первичная синхронизация
  syncState();

  logger.debug('Fullscreen manager initialized');
}

/**
 * Ручной запрос синхронизации — вызывать после изменения флага в настройках.
 * Безопасно вызывать многократно.
 */
export function syncFullscreenState() {
  syncState();
}

/**
 * Совместимость со старым API — оставляем как алиас.
 * @deprecated используйте initFullscreenManager()
 */
export function maybeEnableFullscreenOnFirstInteraction() {
  syncState();
}

/**
 * Отмена любых ожидающих обработчиков.
 * Полезно при смене профиля / сбросе настроек.
 */
export function cancelPendingFullscreen() {
  detachTouchHandler();
}
