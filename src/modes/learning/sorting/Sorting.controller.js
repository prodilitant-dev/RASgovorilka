// src/modes/learning/sorting/Sorting.controller.js
import { startGame } from '@modes/common/games/GameController';
import { generateSortingGame } from './Sorting.logic';
import { renderSortingGame } from './Sorting.view';

export function startSorting(container, profile, settings, onBack, savedState) {
  function generateData(prof, set) {
    const gameData = generateSortingGame(prof, set);
    if (!gameData) return null;
    return {
      cards: gameData.cards,
      zones: gameData.zones.map(z => ({ ...z, items: [] })),
      remainingCards: [...gameData.cards],
      correctCount: 0,
      wrongCount: 0,
      totalCards: gameData.cards.length,
      details: [],
    };
  }

  function renderGame(container, state, onAction) {
    renderSortingGame(container, state, (cardId, zoneCategoryId) => {
      onAction({ type: 'drop', cardId, zoneCategoryId });
    });
  }

  function handleAction(action, state) {
    const { cardId, zoneCategoryId } = action;
    const cardIndex = state.remainingCards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return null;

    const card = state.remainingCards[cardIndex];
    const zone = state.zones.find(z => z.categoryId === zoneCategoryId);
    if (!zone) return null;

    const isCorrect = card.categoryId === zoneCategoryId;
    const newState = {
      ...state,
      remainingCards: state.remainingCards.filter((_, i) => i !== cardIndex),
      zones: state.zones.map(z => {
        if (z.categoryId === zoneCategoryId) {
          return { ...z, items: [...z.items, { ...card, isCorrect }] };
        }
        return z;
      }),
      correctCount: state.correctCount + (isCorrect ? 1 : 0),
      wrongCount: state.wrongCount + (isCorrect ? 0 : 1),
      details: [...state.details, {
        question: card.text,
        userAnswer: zone.name,
        correctAnswer: state.zones.find(z => z.categoryId === card.categoryId)?.name || '',
        correct: isCorrect,
      }],
    };

    const isGameOver = newState.remainingCards.length === 0;
    return { updatedState: newState, isGameOver };
  }

  function checkWin(state) {
    return state.remainingCards.length === 0;
  }

  return startGame({
    container,
    profile,
    settings,
    gameType: 'sorting',
    generateData,
    renderGame,
    handleAction,
    checkWin,
    savedState,
    onBack,
    onGameOver: (stats, state) => {
      const message = `Сортировка завершена! Правильно: ${state.correctCount}, Неправильно: ${state.wrongCount}`;
      return { resultMessage: message, details: state.details };
    },
  });
}