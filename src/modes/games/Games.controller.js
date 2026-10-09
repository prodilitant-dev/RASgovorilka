// src/modes/games/Games.controller.js
import { renderGames } from './Games.view';
import { startMemory } from './memory';
import { startFifteen } from './fifteen';
import { openMemorySettings } from './memory/settings';
import { openFifteenSettings } from './fifteen/settings';
import { getDefaultMemorySettings, getDefaultFifteenSettings } from './defaults';
import { getState, setState } from '@state/store';
import { toast } from '@utils/toast';
import { openSettings } from '@utils';
import { logger } from '@utils/logger';

export function handleGames(container, profile) {
  logger.debug('🔄 Rendering Games mode');

  if (typeof container._modeCleanup === 'function') {
    container._modeCleanup();
    container._modeCleanup = null;
  }

  function stopActiveGame() {
    const g = container._activeGame;
    if (!g) return;
    if (typeof g.stop === 'function') g.stop();
    container._activeGame = null;
  }

  function pauseActiveGame() {
    const g = container._activeGame;
    if (!g) return;
    if (typeof g.pause === 'function') g.pause();
    else if (typeof g.stop === 'function') g.stop();
    container._activeGame = null;
  }

  function onSelectGame(gameId) {
    const state = getState();
    const editingMode = state.editingMode || false;

    stopActiveGame();

    if (editingMode) {
      openGameSettings(gameId, profile, container);
      return;
    }

    const saved = state.activityState;
    switch (gameId) {
      case 'memory': {
        const settings = { ...getDefaultMemorySettings(profile), ...(profile.gamesSettings?.memory || {}) };
        container._activeGame = startMemory(
          container, profile, settings,
          () => {
            setState({ activityState: null });
            container._activeGame = null;
            renderGames(container, onSelectGame);
          },
          saved?.type === 'memory' ? saved : null
        );
        break;
      }
      case 'fifteen': {
        const settings = { ...getDefaultFifteenSettings(profile), ...(profile.gamesSettings?.fifteen || {}) };
        container._activeGame = startFifteen(
          container, profile, settings,
          () => {
            setState({ activityState: null });
            container._activeGame = null;
            renderGames(container, onSelectGame);
          },
          saved?.type === 'fifteen' ? saved : null
        );
        break;
      }
      default:
        container.innerHTML = `<div style="padding:20px;text-align:center;">Игра "${gameId}" в разработке</div>`;
    }
  }

  renderGames(container, onSelectGame);

  container._modeCleanup = () => {
    pauseActiveGame();
    if (typeof container._gamesCleanup === 'function') {
      container._gamesCleanup();
      container._gamesCleanup = null;
    }
    logger.debug('Games mode cleanup done');
  };
}

function openGameSettings(gameId, profile, container) {
  const settingsMap = {
    memory: { openSettingsFn: openMemorySettings, successMessage: 'Настройки Мемори сохранены' },
    fifteen: { openSettingsFn: openFifteenSettings, successMessage: 'Настройки Пятнашек сохранены' },
  };

  const config = settingsMap[gameId];
  if (!config) {
    toast(`Настройки для "${gameId}" пока не доступны`, 'info');
    return;
  }

  openSettings({
    profile,
    settingsKey: gameId,
    settingsType: 'gamesSettings',
    openSettingsFn: config.openSettingsFn,
    renderMenuFn: renderGames,
    container,
    onComplete: (id) => handleGames(container, profile),
    successMessage: config.successMessage
  });
}