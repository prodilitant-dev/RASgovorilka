// src/modes/games/memory/Memory.controller.js
import { clear } from '@utils/dom';
import { renderMemoryBoard } from './Memory.view';
import { generateMemoryPairs } from './Memory.logic';
import { showResultsModal } from '@modes/common/activities/ResultsModal';
import { getState, setState } from '@state/store';
import { speak, stopSpeech } from '@utils/speech';
import { toast } from '@utils/toast';
import { getCardsFromCategories } from '@utils/game/pickCards';

export function startMemory(container, profile, settings, onBack, savedState) {
  // Адаптация размера сетки
  const allCards = getCardsFromCategories(profile, settings.categoryIds || []);
  const numPairs = (settings.gridSize * settings.gridSize) / 2;
  let adjustedSize = settings.gridSize;

  if (allCards.length < numPairs) {
    const maxPairs = allCards.length;
    const possibleSizes = [4, 6, 8];
    let newSize = 4;
    for (const s of possibleSizes) {
      if ((s * s) / 2 <= maxPairs) {
        newSize = s;
      }
    }
    if (newSize !== settings.gridSize) {
      toast(`Недостаточно карточек для сетки ${settings.gridSize}×${settings.gridSize}. Используем ${newSize}×${newSize}.`, 'info');
      adjustedSize = newSize;
    } else {
      toast('Недостаточно карточек для игры. Добавьте карточки в выбранные категории.', 'error');
      onBack();
      return;
    }
  }

  // Инициализация состояния
  let state;
  if (savedState && savedState.type === 'memory') {
    state = savedState;
  } else {
    const cards = generateMemoryPairs(profile, settings.categoryIds, adjustedSize);
    if (cards.length === 0) {
      container.innerHTML = '<div style="padding:20px;text-align:center;">Нет карточек для игры</div>';
      return;
    }
    state = {
      cards,
      gridSize: adjustedSize,
      moves: 0,
      firstCard: null,
      secondCard: null,
      lockBoard: false,
    };
    saveState();
  }

  function saveState() {
    setState({
      activityState: {
        type: 'memory',
        ...state,
        settings,
      },
    });
  }

  function clearState() {
    setState({ activityState: null });
  }

  async function speakFeedback(message) {
    const voiceSettings = getState().voiceSettings || { rate: 1, pitch: 1, voiceURI: '' };
    await speak(message, voiceSettings.rate, voiceSettings.pitch, voiceSettings.voiceURI);
  }

  function render() {
    renderMemoryBoard(container, state, onCardClick);
  }

  function onCardClick(cardId) {
    if (state.lockBoard) return;
    const card = state.cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    // Переворачиваем карточку
    card.isFlipped = true;

    if (!state.firstCard) {
      state.firstCard = card;
      saveState();
      render();
      return;
    }

    if (!state.secondCard) {
      state.secondCard = card;
      state.moves += 1;
      saveState();
      render();

      // Проверяем совпадение
      const first = state.firstCard;
      const second = state.secondCard;

      if (first.pairId === second.pairId) {
        // Совпадение
        first.isMatched = true;
        second.isMatched = true;
        const pairText = first.text || 'картинка';
        speakFeedback(`пара найдена, ${pairText}`);

        state.firstCard = null;
        state.secondCard = null;
        saveState();
        render();

        // Проверяем победу
        if (state.cards.every(c => c.isMatched)) {
          clearState();
          setTimeout(() => showResults(), 500);
        }
      } else {
        // Не совпали – блокируем и через 800 мс переворачиваем обратно
        state.lockBoard = true;
        render();

        setTimeout(() => {
          state.firstCard.isFlipped = false;
          state.secondCard.isFlipped = false;
          state.firstCard = null;
          state.secondCard = null;
          state.lockBoard = false;
          saveState();
          render();
        }, 800);
      }
    }
  }

  async function showResults() {
    const message = `Умничка, все пары найдены за ${state.moves} ходов! 🎉`;
    await speakFeedback(message);

    showResultsModal({
      correct: state.cards.filter(c => c.isMatched).length / 2,
      wrong: state.moves - state.cards.filter(c => c.isMatched).length / 2,
      total: state.moves,
      details: [],
      onRetry: () => {
        clearState();
        startMemory(container, profile, settings, onBack, null);
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
}