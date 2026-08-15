// src/modes/learning/Learning.controller.js
import { renderLearning } from './Learning.view';
import { startQuiz } from './quiz';
import { startGuess } from './guess';
import { startSorting } from './sorting';
import { startMath } from './math';
import { openQuizSettings } from './settings';
import { openGuessSettings } from './guess/settings';
import { openSortingSettings } from './sorting/settings';
import { openMathSettings } from './math/settings';
import {
  getDefaultQuizSettings,
  getDefaultGuessSettings,
  getDefaultSortingSettings,
  getDefaultMathSettings
} from './defaults';
import { getState, setState } from '@state/store';
import { toast } from '@utils/toast';
import { openSettings } from '@utils';

export function handleLearning(container, profile) {
  function onSelectActivity(activityId) {
    const state = getState();
    const editingMode = state.editingMode || false;

    if (editingMode) {
      openActivitySettings(activityId, profile, container);
    } else {
      switch (activityId) {
        case 'quiz': {
          const defaultSettings = getDefaultQuizSettings(profile);
          const settings = { ...defaultSettings, ...(profile.learningSettings?.quiz || {}) };
          startQuiz(container, profile, settings, () => {
            setState({ activityState: null });
            renderLearning(container, onSelectActivity);
          }, state.activityState?.type === 'quiz' ? state.activityState : null);
          break;
        }
        case 'guess': {
          const defaultSettings = getDefaultGuessSettings(profile);
          const settings = { ...defaultSettings, ...(profile.learningSettings?.guess || {}) };
          startGuess(container, profile, settings, () => {
            setState({ activityState: null });
            renderLearning(container, onSelectActivity);
          }, state.activityState?.type === 'guess' ? state.activityState : null);
          break;
        }
        case 'sorting': {
          const defaultSettings = getDefaultSortingSettings(profile);
          const settings = { ...defaultSettings, ...(profile.learningSettings?.sorting || {}) };
          startSorting(container, profile, settings, () => {
            setState({ activityState: null });
            renderLearning(container, onSelectActivity);
          }, state.activityState?.type === 'sorting' ? state.activityState : null);
          break;
        }
        case 'math': {
          const defaultSettings = getDefaultMathSettings(profile);
          const settings = { ...defaultSettings, ...(profile.learningSettings?.math || {}) };
          startMath(container, profile, settings, () => {
            setState({ activityState: null });
            renderLearning(container, onSelectActivity);
          }, state.activityState?.type === 'math' ? state.activityState : null);
          break;
        }
        default:
          container.innerHTML = `<div style="padding:20px;text-align:center;">Активность "${activityId}" в разработке</div>`;
      }
    }
  }

  renderLearning(container, onSelectActivity);
}

function openActivitySettings(activityId, profile, container) {
  const settingsMap = {
    quiz: {
      openSettingsFn: openQuizSettings,
      successMessage: 'Настройки викторины сохранены'
    },
    guess: {
      openSettingsFn: openGuessSettings,
      successMessage: 'Настройки угадайки сохранены'
    },
    sorting: {
      openSettingsFn: openSortingSettings,
      successMessage: 'Настройки сортировки сохранены'
    },
    math: {
      openSettingsFn: openMathSettings,
      successMessage: 'Настройки математики сохранены'
    }
  };

  const config = settingsMap[activityId];
  if (!config) {
    toast(`Настройки для "${activityId}" пока не доступны`, 'info');
    return;
  }

  openSettings({
    profile,
    settingsKey: activityId,
    settingsType: 'learning',
    openSettingsFn: config.openSettingsFn,
    renderMenuFn: renderLearning,
    container,
    onComplete: (id) => handleLearning(container, profile),
    successMessage: config.successMessage
  });
}