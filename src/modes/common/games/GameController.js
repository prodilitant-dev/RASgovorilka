// src/modes/common/games/GameController.js
import { setState } from '@state/store';
import { logger } from '@utils/logger';
import { stopSpeech } from '@utils/speech';
import { showResultsModal } from '@modes/common/activities/ResultsModal';

/**
 * Универсальный контроллер для игр (Memory, Fifteen и др.)
 * Управляет состоянием, ходами, проверкой победы и результатами.
 *
 * @param {Object} params
 * @param {HTMLElement} params.container - контейнер для рендеринга
 * @param {Object} params.profile - текущий профиль (передаётся для доступа к настройкам)
 * @param {Object} params.settings - настройки игры
 * @param {string} params.gameType - уникальный идентификатор игры (например, 'memory', 'fifteen')
 *
 * @param {Function} params.generateData - (profile, settings) => начальное состояние игры
 *    Возвращает объект состояния, который будет храниться в activityState.
 *    Например, для Memory: { cards, gridSize, moves, firstCard, secondCard, lockBoard }
 *    Для Fifteen: { board, emptyIdx, moves, size, mode }
 *
 * @param {Function} params.renderGame - (container, state, onAction) => void
 *    - container: контейнер для рендеринга
 *    - state: текущее состояние игры (из activityState)
 *    - onAction: (actionData) => void – колбэк для действий игрока (клик по карточке, ход и т.д.)
 *
 * @param {Function} params.handleAction - (actionData, state) => { updatedState, isGameOver, resultMessage? }
 *    - actionData: данные действия (например, id карточки или индекс ячейки)
 *    - state: текущее состояние до обработки
 *    - Возвращает обновлённое состояние, флаг завершения игры и сообщение для результатов.
 *
 * @param {Function} params.checkWin - (state) => boolean (опционально)
 *    - Если не передана, используется isGameOver из handleAction.
 *
 * @param {Function} params.renderResults - (container, stats, callbacks) => void (опционально)
 *    - Если не передан, используется стандартный showResultsModal с resultMessage.
 *
 * @param {Object} params.savedState - (опционально) сохранённое состояние из activityState
 * @param {Function} params.onBack - (() => void) колбэк для возврата в меню
 *
 * @param {Function} params.onGameOver - (stats, state) => { resultMessage, details? } (опционально)
 *    - Для формирования специального сообщения и деталей.
 */
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

  // --- Инициализация состояния ---
  let state = savedState || generateData(profile, settings);
  if (!state) {
    container.innerHTML =
      '<div style="padding:20px;text-align:center;">Не удалось инициализировать игру</div>';
    logger.error(`Failed to generate data for ${gameType}`);
    return;
  }

  // Если есть сохранённое состояние, убедимся, что оно имеет правильный тип
  if (savedState) {
    logger.debug(`Restored state for ${gameType}`);
  }

  // --- Сохранение состояния ---
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

  // --- Обработка действия игрока ---
  function onAction(actionData) {
    const result = handleAction(actionData, state);
    if (!result) return;

    // Обновляем состояние
    state = result.updatedState;
    const isGameOver = result.isGameOver || (checkWin ? checkWin(state) : false);

    saveState();

    // Перерисовываем игру (рендерим с новым состоянием)
    renderGame(container, state, onAction);

    if (isGameOver) {
      // Игра завершена
      clearState();
      setTimeout(() => showGameResults(), 500);
    }
  }

  // --- Показ результатов ---
  function showGameResults() {
    // Формируем статистику
    const stats = {
      moves: state.moves || 0,
      // Дополнительные данные можно добавить через onGameOver
    };

    let resultMessage = null;
    let details = [];

    if (onGameOver) {
      const custom = onGameOver(stats, state);
      resultMessage = custom.resultMessage || null;
      details = custom.details || [];
    }

    // Если не передан кастомный рендеринг результатов – используем модалку
    if (renderResults) {
      renderResults(container, stats, {
        onRetry: () => {
          clearState();
          startGame({
            container,
            profile,
            settings,
            gameType,
            generateData,
            renderGame,
            handleAction,
            checkWin,
            renderResults,
            savedState: null,
            onBack,
            onGameOver,
          });
        },
        onBack: () => {
          clearState();
          if (onBack) onBack();
        },
      });
    } else {
      // Используем стандартную модалку результатов
      showResultsModal({
        correct: 0, // для игр не используется
        wrong: 0,
        total: stats.moves,
        details,
        onRetry: () => {
          clearState();
          startGame({
            container,
            profile,
            settings,
            gameType,
            generateData,
            renderGame,
            handleAction,
            checkWin,
            renderResults,
            savedState: null,
            onBack,
            onGameOver,
          });
        },
        onBack: () => {
          clearState();
          if (onBack) onBack();
        },
        resultMessage: resultMessage || `Игра завершена за ${stats.moves} ходов! 🎉`,
        showDetails: false, // для игр детали обычно не показываем
      });
    }
  }

  // --- Старт ---
  saveState();
  renderGame(container, state, onAction);

  // Возвращаем управление
  return {
    stop: () => {
      stopSpeech();
      clearState();
    },
    restart: () => {
      stopSpeech();
      clearState();
      startGame({
        container,
        profile,
        settings,
        gameType,
        generateData,
        renderGame,
        handleAction,
        checkWin,
        renderResults,
        savedState: null,
        onBack,
        onGameOver,
      });
    },
  };
}