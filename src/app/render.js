// src/app/render.js
import { createHeader } from '@components/Header/Header';
import { renderModeBar } from '@components/ModeBar/ModeBar';
import { createMainArea } from '@components/MainArea/MainArea';
import { renderPlaceholder } from '@components/MainArea/renderPlaceholder';
import { renderProfiles } from '@modes/profiles';
import { renderGeneral } from '@modes/general';
import { renderSay } from '@modes/say';
import { renderWrite } from '@modes/write';
import { handleLearning } from '@modes/learning';
import { handleGames } from '@modes/games';
// ✅ Импортируем новые режимы
import { renderYesNo } from '@modes/yesno';
import { renderSchedule } from '@modes/schedule';
import { getState, setState } from '@state/store';
import { getActiveProfile } from '@state/actions';
import { openProfileSwitchModal } from '@components/Profile/ProfileSwitchModal';
import { logger } from '@utils/logger';

// --- Обработчики ---
function handleProfileClick() {
  const state = getState();
  if (state.editingMode) {
    const prev = state.previousMode || 'say';
    setState({ editingMode: false, currentMode: prev, previousMode: null });
    renderApp();
    return;
  }
  openProfileSwitchModal((newProfileId) => {
    renderApp();
  });
}

function handleProfileLongPress() {
  const state = getState();
  if (!state.editingMode) {
    const prev = state.currentMode;
    logger.info('Entering editing mode, previous mode:', prev);
    setState({ previousMode: prev, editingMode: true, currentMode: 'profiles' });
    renderApp();
  }
}

// --- Рендер всего приложения ---
export function renderApp() {
  logger.debug('🔄 Rendering App');
  const app = document.getElementById('app');
  app.innerHTML = '';
  const state = getState();

  // ✅ Получаем активный профиль и его иконку
  const activeProfile = getActiveProfile();
  const profileIcon = state.editingMode
    ? '✕'
    : (activeProfile?.icon || '👤');

  const { header, modeBarSlot } = createHeader({
    profileIcon,
    onProfileClick: handleProfileClick,
    onProfileLongPress: handleProfileLongPress,
  });
  app.appendChild(header);

  const mainArea = createMainArea();
  app.appendChild(mainArea);

  renderModeBar(
    modeBarSlot,
    state.currentMode,
    (modeId) => {
      logger.info(`Mode selected: ${modeId}`);
      setState({ currentMode: modeId });
      renderContent(mainArea, modeId);
    },
    state.editingMode,
    state.hiddenModes || [],
    state.modeOrder || []
  );

  renderContent(mainArea, state.currentMode);

  logger.debug('✅ App rendered');
  return { modeBarSlot, mainArea };
}

// --- Рендер контента в зависимости от режима ---
export function renderContent(container, modeId) {
  logger.debug(`📱 Switching to mode: ${modeId}`);
  switch (modeId) {
    case 'profiles':
      renderProfiles(container);
      break;
    case 'general':
      renderGeneral(container);
      break;
    case 'say': {
      const profile = getActiveProfile();
      if (profile) {
        renderSay(container, profile);
      } else {
        renderPlaceholder(container, 'say (нет профиля)');
      }
      break;
    }
    case 'write': {
      const profile = getActiveProfile();
      if (profile) {
        renderWrite(container, profile);
      } else {
        renderPlaceholder(container, 'write (нет профиля)');
      }
      break;
    }
    case 'learning': {
      const profile = getActiveProfile();
      if (profile) {
        handleLearning(container, profile);
      } else {
        renderPlaceholder(container, 'learning (нет профиля)');
      }
      break;
    }
    case 'games': {
      const profile = getActiveProfile();
      if (profile) {
        handleGames(container, profile);
      } else {
        renderPlaceholder(container, 'games (нет профиля)');
      }
      break;
    }
    // ✅ НОВЫЕ РЕЖИМЫ
    case 'yesno': {
      const profile = getActiveProfile();
      if (profile) {
        renderYesNo(container, profile);
      } else {
        renderPlaceholder(container, 'yesno (нет профиля)');
      }
      break;
    }
    case 'schedule': {
      const profile = getActiveProfile();
      if (profile) {
        renderSchedule(container, profile);
      } else {
        renderPlaceholder(container, 'schedule (нет профиля)');
      }
      break;
    }
    default:
      renderPlaceholder(container, modeId);
      break;
  }
}