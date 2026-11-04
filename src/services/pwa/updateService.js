// src/services/pwa/updateService.js
import { registerSW } from 'virtual:pwa-register';
import { logger } from '@utils/logger';

const LAST_CHECK_KEY = 'ras_lastUpdateCheck';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // раз в сутки
const SKIP_START_KEY = 'skipStartScreen';

let updateSWFn = null;
let isInitialized = false;
let hasUpdate = false;

/**
 * Инициализирует SW. Вызывается один раз из main.js.
 * В dev-режиме ничего не делает.
 */
export function initSW() {
  if (!import.meta.env.PROD) {
    logger.debug('SW не инициализируется в dev-режиме');
    return;
  }
  if (isInitialized) return;
  isInitialized = true;

  updateSWFn = registerSW({
    immediate: false,
    onNeedRefresh() {
      hasUpdate = true;
      logger.info('[SW] Доступно обновление');
    },
    onOfflineReady() {
      logger.info('[SW] Готово к офлайн-работе');
    },
    onRegistered(_registration) {
      logger.info('[SW] Registered');
    },
    onRegisterError(error) {
      logger.error('[SW] Registration failed', error);
    },
  });
}

/**
 * Возвращает текущий статус обновления без сетевых запросов.
 * @returns {Promise<'available'|'up-to-date'|'no-sw'>}
 */
export async function getUpdateStatus() {
  if (!('serviceWorker' in navigator)) return 'no-sw';
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return 'no-sw';
    if (hasUpdate || reg.waiting) return 'available';
    return 'up-to-date';
  } catch (e) {
    logger.warn('getUpdateStatus error:', e);
    return 'no-sw';
  }
}

/**
 * Фоновая проверка обновлений на старте.
 * - не чаще раза в сутки (lastUpdateCheck в localStorage);
 * - только при navigator.onLine;
 * - НИКОГДА не показывает тосты/ошибки — просто возвращает статус.
 *   Решение о показе тоста принимает вызывающий код.
 *
 * @returns {Promise<{status: 'update-available'|'up-to-date'|'offline'|'no-sw'|'error'}>}
 */
export async function checkUpdateInBackground() {
  if (!('serviceWorker' in navigator)) return { status: 'no-sw' };
  if (!navigator.onLine) return { status: 'offline' };

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return { status: 'no-sw' };

    // Если обновление уже ждёт активации — не дёргаем сеть зря
    if (hasUpdate || reg.waiting) {
      return { status: 'update-available' };
    }

    // Троттлинг: не чаще раза в сутки
    const last = Number(localStorage.getItem(LAST_CHECK_KEY) || 0);
    if (Date.now() - last < CHECK_INTERVAL_MS) {
      return { status: 'up-to-date' };
    }

    await reg.update();
    // Даём 1.5 сек на скачивание и установку новой версии
    await new Promise((r) => setTimeout(r, 1500));

    // lastUpdateCheck пишем только при успешной проверке (не в офлайне/ошибке)
    localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));

    if (hasUpdate || reg.waiting) {
      return { status: 'update-available' };
    }
    return { status: 'up-to-date' };
  } catch (e) {
    logger.warn('checkUpdateInBackground error:', e);
    return { status: 'error' };
  }
}

/**
 * Проверяет наличие обновления вручную (из настроек).
 * Не активирует — просто сообщает статус.
 *
 * @returns {Promise<{status: 'update-available'|'up-to-date'|'offline'|'no-sw'|'error'}>}
 */
export async function checkForUpdate() {
  if (!('serviceWorker' in navigator)) {
    return { status: 'no-sw' };
  }
  if (!navigator.onLine) {
    return { status: 'offline' };
  }

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      return { status: 'no-sw' };
    }

    await reg.update();
    await new Promise((r) => setTimeout(r, 1500));

    if (hasUpdate || reg.waiting) {
      return { status: 'update-available' };
    }

    return { status: 'up-to-date' };
  } catch (e) {
    logger.error('checkForUpdate error:', e);
    return { status: 'error' };
  }
}

/**
 * Применяет обновление (активирует новый SW + перезагружает страницу).
 * Вызывать только после checkForUpdate, если статус 'update-available'.
 *
 * Ставит флаг skipStartScreen, чтобы после перезагрузки не показывать
 * стартовый экран — пользователь уже нажал «Обновить», лишний тап не нужен.
 */
export function applyUpdate() {
  sessionStorage.setItem(SKIP_START_KEY, '1');
  if (updateSWFn) {
    updateSWFn(true); // true = перезагрузить страницу
  } else {
    logger.warn('applyUpdate: updateSWFn не инициализирован');
    location.reload();
  }
}

/**
 * Читает и сбрасывает флаг «пропустить старт-экран» (ставится в applyUpdate).
 * @returns {boolean}
 */
export function consumeSkipStartScreen() {
  const skip = sessionStorage.getItem(SKIP_START_KEY) === '1';
  if (skip) sessionStorage.removeItem(SKIP_START_KEY);
  return skip;
}