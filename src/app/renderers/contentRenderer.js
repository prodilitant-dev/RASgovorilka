// src/app/renderers/contentRenderer.js
import { renderPlaceholder } from '@components/MainArea/renderPlaceholder';
import { renderProfiles } from '@modes/profiles';
import { renderGeneral } from '@modes/general';
import { renderSay } from '@modes/say';
import { renderWrite } from '@modes/write';
import { handleLearning } from '@modes/learning';
import { handleGames } from '@modes/games';
import { renderYesNo } from '@modes/yesno';
import { renderSchedule } from '@modes/schedule';
import { getActiveProfile } from '@state/actions';
import { ensureActiveProfile } from '@app/helpers/profileHelpers';
import { logger } from '@utils/logger';

// Карта режимов: modeId -> функция рендера
const modeRenderers = {
  profiles: (container) => renderProfiles(container),
  general: (container) => renderGeneral(container),
  say: (container) => {
    const profile = getActiveProfile();
    if (profile) {
      renderSay(container, profile);
    } else {
      renderPlaceholder(container, 'say (нет профиля)');
    }
  },
  write: (container) => {
    const profile = getActiveProfile();
    if (profile) {
      renderWrite(container, profile);
    } else {
      renderPlaceholder(container, 'write (нет профиля)');
    }
  },
  learning: (container) => {
    const profile = getActiveProfile();
    if (profile) {
      handleLearning(container, profile);
    } else {
      renderPlaceholder(container, 'learning (нет профиля)');
    }
  },
  games: (container) => {
    const profile = getActiveProfile();
    if (profile) {
      handleGames(container, profile);
    } else {
      renderPlaceholder(container, 'games (нет профиля)');
    }
  },
  yesno: (container) => {
    const profile = getActiveProfile();
    if (profile) {
      renderYesNo(container, profile);
    } else {
      renderPlaceholder(container, 'yesno (нет профиля)');
    }
  },
  schedule: (container) => {
    const profile = getActiveProfile();
    if (profile) {
      renderSchedule(container, profile);
    } else {
      renderPlaceholder(container, 'schedule (нет профиля)');
    }
  },
};

/**
 * Рендерит контент в зависимости от режима
 * @param {HTMLElement} container - основная область
 * @param {string} modeId - идентификатор режима
 */
export function renderContent(container, modeId) {
  logger.debug(`📱 Switching to mode: ${modeId}`);
  const renderFn = modeRenderers[modeId];
  if (renderFn) {
    renderFn(container);
  } else {
    renderPlaceholder(container, modeId);
  }
}