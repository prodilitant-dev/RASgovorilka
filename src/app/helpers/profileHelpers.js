// src/app/helpers/profileHelpers.js
import { getState, setState } from '@state/store';
import { getActiveProfile } from '@state/actions';
import { logger } from '@utils/logger';

/**
 * Возвращает иконку для кнопки профиля
 * @param {Object} state - глобальное состояние
 * @returns {string} иконка (эмодзи)
 */
export function getProfileIcon(state) {
  if (state.editingMode) return '✕';
  const profile = getActiveProfile();
  return profile?.icon || '👤';
}

/**
 * Проверяет, что активный профиль существует.
 * Если нет – устанавливает первый из списка.
 * @param {Object} state - глобальное состояние
 * @param {Function} setStateFn - функция обновления состояния (по умолчанию setState)
 * @returns {Object|null} активный профиль или null
 */
export function ensureActiveProfile(state, setStateFn = setState) {
  let activeProfile = getActiveProfile();
  if (!activeProfile && state.profiles.length > 0) {
    // Выбираем первый профиль
    const first = state.profiles[0];
    setStateFn({ currentProfileId: first.id });
    activeProfile = first;
    logger.warn('Активный профиль отсутствовал, установлен первый:', first.id);
  }
  return activeProfile;
}

/**
 * Получает активный профиль с проверкой и логированием
 * @returns {Object|null}
 */
export function getActiveProfileSafe() {
  const profile = getActiveProfile();
  if (!profile) {
    logger.warn('getActiveProfileSafe: активный профиль не найден');
  }
  return profile;
}