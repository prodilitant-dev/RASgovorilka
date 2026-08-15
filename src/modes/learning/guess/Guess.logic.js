// src/modes/learning/guess/Guess.logic.js
import { shuffle } from '@utils/array';
import { getCardsFromCategories } from '@utils/game/pickCards';

export function generateGuessQuestions(profile, settings) {
  const { categoryIds, numQuestions } = settings;
  const allCards = getCardsFromCategories(profile, categoryIds);
  if (allCards.length === 0) return [];

  const shuffled = shuffle([...allCards]);
  const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));

  return selected.map((card) => ({
    card,
    correctAnswer: card.text.trim().toLowerCase(),
  }));
}