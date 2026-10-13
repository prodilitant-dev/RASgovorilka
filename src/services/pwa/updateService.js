// src/services/pwa/updateService.js
import { registerSW } from 'virtual:pwa-register';
import { logger } from '@utils/logger';

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
    immediate: true,
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
 * Проверяет наличие обновления.
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

    // Принудительная проверка обновлений на сервере
    await reg.update();

    // Даём 1.5 сек на скачивание и установку новой версии
    await new Promise((r) => setTimeout(r, 1500));

    // Если флаг установлен ИЛИ есть waiting worker — обновление готово
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
 */
export function applyUpdate() {
  if (updateSWFn) {
    updateSWFn(true); // true = перезагрузить страницу
  } else {
    logger.warn('applyUpdate: updateSWFn не инициализирован');
    location.reload();
  }
}
