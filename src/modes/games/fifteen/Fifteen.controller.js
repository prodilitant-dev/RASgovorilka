// src/modes/games/fifteen/Fifteen.controller.js
import { renderFifteenBoard } from './Fifteen.view';
import { generateFifteenBoard } from './Fifteen.logic';
import { showResultsModal } from '@modes/common/activities/ResultsModal';
import { getState, setState } from '@state/store';
import { speak, stopSpeech } from '@utils/speech';
import { toast } from '@utils/toast';

export function startFifteen(container, profile, settings, onBack, savedState) {
  let state;
  if (savedState && savedState.type === 'fifteen') {
    state = savedState;
  } else {
    const result = generateFifteenBoard(settings.size);
    if (!result) {
      container.innerHTML = '<div style="padding:20px;text-align:center;">Не удалось создать доску. Проверьте настройки.</div>';
      toast('Ошибка генерации доски', 'error');
      return null;
    }
    state = {
      board: result.values,
      emptyIdx: result.emptyIndex,
      moves: 0,
      size: settings.size,
    };
    saveState();
  }

  let resultTimer = null;

  function saveState() {
    setState({
      activityState: {
        type: 'fifteen',
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

  async function speakFeedback(message) {
    const voiceSettings = getState().voiceSettings || { rate: 1, pitch: 1, voiceURI: '' };
    await speak(message, voiceSettings.rate, voiceSettings.pitch, voiceSettings.voiceURI);
  }

  function render() {
    renderFifteenBoard(container, state, onCellClick);
  }

  function onCellClick(index) {
    if (index === state.emptyIdx) return;

    const size = state.size;
    const cellRow = Math.floor(index / size);
    const cellCol = index % size;
    const emptyRow = Math.floor(state.emptyIdx / size);
    const emptyCol = state.emptyIdx % size;

    const isAdjacent = (Math.abs(cellRow - emptyRow) + Math.abs(cellCol - emptyCol)) === 1;
    if (!isAdjacent) return;

    state.board[state.emptyIdx] = state.board[index];
    state.board[index] = null;
    state.emptyIdx = index;
    state.moves += 1;

    saveState();
    render();

    if (checkWin()) {
      clearState();
      clearResultTimer();
      resultTimer = setTimeout(() => {
        resultTimer = null;
        showResults();
      }, 500);
    }
  }

  function checkWin() {
    for (let i = 0; i < state.board.length - 1; i++) {
      if (state.board[i] !== i + 1) return false;
    }
    return state.board[state.board.length - 1] === null;
  }

  async function showResults() {
    const message = `Умничка, пройдено за ${state.moves} ходов! 🎉`;
    await speakFeedback(message);

    showResultsModal({
      correct: 0,
      wrong: 0,
      total: state.moves,
      details: [],
      onRetry: () => {
        clearState();
        startFifteen(container, profile, settings, onBack, null);
      },
      onBack: () => {
        clearState();
        if (onBack) onBack();
      },
      resultMessage: message,
      showDetails: false,
    });
  }

  render();

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
  };
}