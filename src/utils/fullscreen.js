// src/utils/fullscreen.js
import { getState } from '@state/store';
import { logger } from './logger';

let handlerAttached = false;

function requestFs() {
  const el = document.documentElement;
  if (!el.requestFullscreen) return;
  el.requestFullscreen().catch(err => {
    logger.warn('Fullscreen request failed:', err);
  });
}

/**
 * Если в настройках профиля включён полноэкранный режим —
 * подписываемся на первое касание/клик пользователя и в этот момент
 * запрашиваем fullscreen. Браузеры не разрешают вызывать
 * requestFullscreen без user gesture, поэтому по-другому не получится.
 */
export function maybeEnableFullscreenOnFirstInteraction() {
  const state = getState();
  if (state.globalSettings?.fullscreen !== true) return;
  if (document.fullscreenElement) return;   // уже вошли
  if (handlerAttached) return;

  handlerAttached = true;
  let done = false;

  const cleanup = () => {
    document.removeEventListener('pointerdown', tryFs, true);
    document.removeEventListener('touchstart', tryFs, true);
    document.removeEventListener('click', tryFs, true);
    handlerAttached = false;
  };

  function tryFs() {
    if (done) return;
    done = true;
    cleanup();
    if (document.fullscreenElement) return; // кто-то успел до нас
    requestFs();
  }

  document.addEventListener('pointerdown', tryFs, true);
  document.addEventListener('touchstart', tryFs, true);
  document.addEventListener('click', tryFs, true);

  logger.debug('Fullscreen: waiting for first user interaction');
}

/**
 * Снимает возможный текущий обработчик. Полезно вызывать при смене
 * профиля / настроек, чтобы не осталось висящих слушателей.
 */
export function cancelPendingFullscreen() {
  handlerAttached = false;
}