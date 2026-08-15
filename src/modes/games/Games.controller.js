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

export function handleGames(container, profile) {
  function onSelectGame(gameId) {
    const state = getState();
    const editingMode = state.editingMode || false;

    if (editingMode) {
      openGameSettings(gameId, profile, container);
    } else {
      switch (gameId) {
        case 'memory': {
          const defaultSettings = getDefaultMemorySettings(profile);
          const settings = { ...defaultSettings, ...(profile.gamesSettings?.memory || {}) };
          startMemory(container, profile, settings, () => {
            setState({ activityState: null });
            renderGames(container, onSelectGame);
          }, state.activityState?.type === 'memory' ? state.activityState : null);
          break;
        }
        case 'fifteen': {
          const defaultSettings = getDefaultFifteenSettings(profile);
          const settings = { ...defaultSettings, ...(profile.gamesSettings?.fifteen || {}) };
          startFifteen(container, profile, settings, () => {
            setState({ activityState: null });
            renderGames(container, onSelectGame);
          }, state.activityState?.type === 'fifteen' ? state.activityState : null);
          break;
        }
        default:
          container.innerHTML = `<div style="padding:20px;text-align:center;">Игра "${gameId}" в разработке</div>`;
      }
    }
  }

  renderGames(container, onSelectGame);
}

function openGameSettings(gameId, profile, container) {
  const settingsMap = {
    memory: {
      openSettingsFn: openMemorySettings,
      successMessage: 'Настройки Мемори сохранены'
    },
    fifteen: {
      openSettingsFn: openFifteenSettings,
      successMessage: 'Настройки Пятнашек сохранены'
    }
  };

  const config = settingsMap[gameId];
  if (!config) {
    toast(`Настройки для "${gameId}" пока не доступны`, 'info');
    return;
  }

  openSettings({
    profile,
    settingsKey: gameId,
    settingsType: 'games',
    openSettingsFn: config.openSettingsFn,
    renderMenuFn: renderGames,
    container,
    onComplete: (id) => handleGames(container, profile),
    successMessage: config.successMessage
  });
}