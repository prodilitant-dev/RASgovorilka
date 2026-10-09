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
import { closeAllModals } from '@components/common/Modal/Modal';
import { logger } from '@utils/logger';

const modeRenderers = {
  profiles: (container) => renderProfiles(container),
  general: (container) => renderGeneral(container),
  say: (container) => {
    const profile = getActiveProfile();
    if (profile) renderSay(container, profile);
    else renderPlaceholder(container, 'say (нет профиля)');
  },
  write: (container) => {
    const profile = getActiveProfile();
    if (profile) renderWrite(container, profile);
    else renderPlaceholder(container, 'write (нет профиля)');
  },
  learning: (container) => {
    const profile = getActiveProfile();
    if (profile) handleLearning(container, profile);
    else renderPlaceholder(container, 'learning (нет профиля)');
  },
  games: (container) => {
    const profile = getActiveProfile();
    if (profile) handleGames(container, profile);
    else renderPlaceholder(container, 'games (нет профиля)');
  },
  yesno: (container) => {
    const profile = getActiveProfile();
    if (profile) renderYesNo(container, profile);
    else renderPlaceholder(container, 'yesno (нет профиля)');
  },
  schedule: (container) => {
    const profile = getActiveProfile();
    if (profile) renderSchedule(container, profile);
    else renderPlaceholder(container, 'schedule (нет профиля)');
  },
};

export function renderContent(container, modeId) {
  logger.debug(`📱 Switching to mode: ${modeId}`);

  // 1. Закрываем все модалки
  closeAllModals();

  // 2. Снимаем cleanup предыдущего режима
  if (typeof container._modeCleanup === 'function') {
    try {
      container._modeCleanup();
    } catch (err) {
      logger.error('Mode cleanup failed:', err);
    }
    container._modeCleanup = null;
  }

  // 3. Рендерим новый режим
  const renderFn = modeRenderers[modeId];
  if (renderFn) {
    renderFn(container);
  } else {
    renderPlaceholder(container, modeId);
  }
}