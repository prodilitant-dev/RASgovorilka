// src/modes/common/games/GameController.js
import { setState } from '@state/store';
import { logger } from '@utils/logger';
import { stopSpeech } from '@utils/speech';
import { showResultsModal } from '@modes/common/activities/ResultsModal';

export function startGame({
  container,
  profile,
  settings,
  gameType,
  generateData,
  renderGame,
  handleAction,
  checkWin = null,
  renderResults = null,
  savedState = null,
  onBack,
  onGameOver = null,
}) {
  logger.debug(`🎮 Starting game: ${gameType}`);

  let state = savedState || generateData(profile, settings);
  if (!state) {
    container.innerHTML = '<div style="padding:20px;text-align:center;">Не удалось инициализировать игру</div>';
    logger.error(`Failed to generate data for ${gameType}`);
    return null;
  }

  let resultTimer = null;

  function saveState() {
    setState({
      activityState: {
        type: gameType,
        ...state,
        settings,
      },
    });
  }

  function clearState() {
    setState({ activityState: null });
  }

  function clearResultTimer() {
    if (resultTimer) {
      clearTimeout(resultTimer);
      resultTimer = null;
    }
  }

  function onAction(actionData) {
    const result = handleAction(actionData, state);
    if (!result) return;

    state = result.updatedState;
    const isGameOver = result.isGameOver || (checkWin ? checkWin(state) : false);

    saveState();
    renderGame(container, state, onAction);

    if (isGameOver) {
      clearState();
      clearResultTimer();
      resultTimer = setTimeout(() => {
        resultTimer = null;
        showGameResults();
      }, 500);
    }
  }

  function showGameResults() {
    const stats = { moves: state.moves || 0 };
    let resultMessage = null;
    let details = [];

    if (onGameOver) {
      const custom = onGameOver(stats, state);
      resultMessage = custom.resultMessage || null;
      details = custom.details || [];
    }

    if (renderResults) {
      renderResults(container, stats, {
        onRetry: () => {
          clearState();
          startGame({
            container, profile, settings, gameType,
            generateData, renderGame, handleAction, checkWin,
            renderResults, savedState: null, onBack, onGameOver,
          });
        },
        onBack: () => {
          clearState();
          if (onBack) onBack();
        },
      });
    } else {
      showResultsModal({
        correct: 0,
        wrong: 0,
        total: stats.moves,
        details,
        onRetry: () => {
          clearState();
          startGame({
            container, profile, settings, gameType,
            generateData, renderGame, handleAction, checkWin,
            renderResults, savedState: null, onBack, onGameOver,
          });
        },
        onBack: () => {
          clearState();
          if (onBack) onBack();
        },
        resultMessage: resultMessage || `Игра завершена за ${stats.moves} ходов! 🎉`,
        showDetails: false,
      });
    }
  }

  saveState();
  renderGame(container, state, onAction);

  return {
    stop: () => {
      clearResultTimer();
      stopSpeech();
      clearState();
    },
    pause: () => {
      clearResultTimer();
      stopSpeech();
    },
    restart: () => {
      clearResultTimer();
      stopSpeech();
      clearState();
      startGame({
        container, profile, settings, gameType,
        generateData, renderGame, handleAction, checkWin,
        renderResults, savedState: null, onBack, onGameOver,
      });
    },
  };
}