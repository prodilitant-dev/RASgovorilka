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
import { logger } from '@utils/logger';

export function handleLearning(container, profile) {
  logger.debug('🔄 Rendering Learning mode');

  // Снимаем предыдущий режимный cleanup
  if (typeof container._modeCleanup === 'function') {
    container._modeCleanup();
    container._modeCleanup = null;
  }

  function stopActiveActivity() {
    const act = container._activeActivity;
    if (!act) return;
    if (typeof act.stop === 'function') {
      act.stop();
    }
    container._activeActivity = null;
  }

  function pauseActiveActivity() {
    const act = container._activeActivity;
    if (!act) return;
    if (typeof act.pause === 'function') {
      act.pause();
    } else if (typeof act.stop === 'function') {
      act.stop();
    }
    container._activeActivity = null;
  }

  function onSelectActivity(activityId) {
    const state = getState();
    const editingMode = state.editingMode || false;

    // Если запускаем новую — старая закрывается полностью
    stopActiveActivity();

    if (editingMode) {
      openActivitySettings(activityId, profile, container);
      return;
    }

    const saved = state.activityState;
    switch (activityId) {
      case 'quiz': {
        const settings = { ...getDefaultQuizSettings(profile), ...(profile.learningSettings?.quiz || {}) };
        container._activeActivity = startQuiz(
          container, profile, settings,
          () => {
            setState({ activityState: null });
            container._activeActivity = null;
            renderLearning(container, onSelectActivity);
          },
          saved?.type === 'quiz' ? saved : null
        );
        break;
      }
      case 'guess': {
        const settings = { ...getDefaultGuessSettings(profile), ...(profile.learningSettings?.guess || {}) };
        container._activeActivity = startGuess(
          container, profile, settings,
          () => {
            setState({ activityState: null });
            container._activeActivity = null;
            renderLearning(container, onSelectActivity);
          },
          saved?.type === 'guess' ? saved : null
        );
        break;
      }
      case 'sorting': {
        const settings = { ...getDefaultSortingSettings(profile), ...(profile.learningSettings?.sorting || {}) };
        container._activeActivity = startSorting(
          container, profile, settings,
          () => {
            setState({ activityState: null });
            container._activeActivity = null;
            renderLearning(container, onSelectActivity);
          },
          saved?.type === 'sorting' ? saved : null
        );
        break;
      }
      case 'math': {
        const settings = { ...getDefaultMathSettings(profile), ...(profile.learningSettings?.math || {}) };
        container._activeActivity = startMath(
          container, profile, settings,
          () => {
            setState({ activityState: null });
            container._activeActivity = null;
            renderLearning(container, onSelectActivity);
          },
          saved?.type === 'math' ? saved : null
        );
        break;
      }
      default:
        container.innerHTML = `<div style="padding:20px;text-align:center;">Активность "${activityId}" в разработке</div>`;
    }
  }

  renderLearning(container, onSelectActivity);

  container._modeCleanup = () => {
    pauseActiveActivity();
    if (typeof container._learningCleanup === 'function') {
      container._learningCleanup();
      container._learningCleanup = null;
    }
    logger.debug('Learning mode cleanup done');
  };
}

function openActivitySettings(activityId, profile, container) {
  const settingsMap = {
    quiz: { openSettingsFn: openQuizSettings, successMessage: 'Настройки викторины сохранены' },
    guess: { openSettingsFn: openGuessSettings, successMessage: 'Настройки угадайки сохранены' },
    sorting: { openSettingsFn: openSortingSettings, successMessage: 'Настройки сортировки сохранены' },
    math: { openSettingsFn: openMathSettings, successMessage: 'Настройки математики сохранены' },
  };

  const config = settingsMap[activityId];
  if (!config) {
    toast(`Настройки для "${activityId}" пока не доступны`, 'info');
    return;
  }

  openSettings({
    profile,
    settingsKey: activityId,
    settingsType: 'learningSettings',
    openSettingsFn: config.openSettingsFn,
    renderMenuFn: renderLearning,
    container,
    onComplete: (id) => handleLearning(container, profile),
    successMessage: config.successMessage
  });
}