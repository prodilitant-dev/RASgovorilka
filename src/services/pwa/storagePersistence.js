// src/services/pwa/storagePersistence.js
import { logger } from '@utils/logger';

/**
 * Проверяет и запрашивает «постоянное» хранилище у браузера.
 *
 * Если браузер предоставляет разрешение — данные (IndexedDB, Cache API)
 * не будут автоматически удалены при нехватке места или (в Safari)
 * через N дней неактивности.
 *
 * Не показывает диалогов — современные браузеры (Chrome, Edge, Firefox ≥118)
 * решают по своим эвристикам: установлен как PWA, engagement, bookmarks.
 * Safari метод не поддерживает — вернёт { grantedBy: 'unsupported' }.
 *
 * Безопасно вызывать сколько угодно раз: повторные вызовы после grant
 * возвращают `true` мгновенно (через navigator.storage.persisted()).
 *
 * @returns {Promise<{persisted: boolean, grantedBy: 'already'|'granted'|'denied'|'unsupported'}>}
 */
export async function ensurePersistentStorage() {
  // 1. Проверяем поддержку API
  if (!navigator.storage || typeof navigator.storage.persist !== 'function') {
    logger.debug('Storage Persistence API не поддерживается');
    return { persisted: false, grantedBy: 'unsupported' };
  }

  try {
    // 2. Уже предоставлено? Проверка без запроса — быстрая
    if (typeof navigator.storage.persisted === 'function') {
      const already = await navigator.storage.persisted();
      if (already) {
        logger.debug('Постоянное хранилище: уже предоставлено');
        return { persisted: true, grantedBy: 'already' };
      }
    }

    // 3. Запрашиваем. Браузер решает по эвристикам, без диалога.
    const granted = await navigator.storage.persist();
    if (granted) {
      logger.info('Постоянное хранилище: предоставлено');
      return { persisted: true, grantedBy: 'granted' };
    }

    logger.warn(
      'Постоянное хранилище: отказано. Данные могут быть очищены браузером при нехватке места.'
    );
    return { persisted: false, grantedBy: 'denied' };
  } catch (e) {
    logger.error('ensurePersistentStorage error:', e);
    return { persisted: false, grantedBy: 'denied' };
  }
}
