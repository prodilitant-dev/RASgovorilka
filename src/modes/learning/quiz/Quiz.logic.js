// src/modes/learning/quiz/Quiz.logic.js
import { shuffle } from '@utils/array';
import { getCardsFromCategories } from '@utils/game/pickCards';

export function generateQuizQuestions(profile, settings) {
  const { categoryIds, numQuestions, numOptions } = settings;
  const allCards = getCardsFromCategories(profile, categoryIds);
  if (allCards.length === 0) return [];

  const shuffled = shuffle([...allCards]);
  const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));

  return selected.map((card) => {
    const others = allCards.filter(c => c.id !== card.id);
    const shuffledOthers = shuffle([...others]);
    const options = [card, ...shuffledOthers.slice(0, numOptions - 1)];
    const shuffledOptions = shuffle(options);

    return {
      card,
      correctId: card.id,
      correctAnswerText: card.text,
      options: shuffledOptions,
    };
  });
}