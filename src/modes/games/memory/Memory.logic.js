// src/modes/games/memory/Memory.logic.js
import { shuffle } from '@utils/array';
import { getCardsFromCategories } from '@utils/game/pickCards';
import { uid } from '@utils/id';

/**
 * Генерирует пары карточек для игры Мемори.
 * @param {Object} profile - профиль пользователя
 * @param {Array<string>} categoryIds - ID категорий для выбора карточек
 * @param {number} gridSize - размер сетки (4, 6, 8) -> итого gridSize * gridSize / 2 пар
 * @returns {Array} массив объектов { id, pairId, emoji, imageId, text, isFlipped, isMatched }
 */
export function generateMemoryPairs(profile, categoryIds, gridSize) {
  const allCards = getCardsFromCategories(profile, categoryIds);
  if (allCards.length === 0) return [];

  const numPairs = (gridSize * gridSize) / 2;
  let selected = [];

  // Если карточек меньше, чем нужно пар, дублируем их случайным образом
  if (allCards.length < numPairs) {
    selected = [...allCards];
    while (selected.length < numPairs) {
      const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
      selected.push({
        ...randomCard,
        id: randomCard.id + '_dup_' + Date.now() + Math.random()
      });
    }
  } else {
    const shuffled = shuffle([...allCards]);
    selected = shuffled.slice(0, numPairs);
  }

  // Создаём пары
  let pairs = [];
  selected.forEach((card, index) => {
    const pairId = index;
    pairs.push({
      id: uid(),
      pairId: pairId,
      emoji: card.emoji,
      imageId: card.imageId,
      text: card.text,
      isFlipped: false,
      isMatched: false,
    });
    pairs.push({
      id: uid(),
      pairId: pairId,
      emoji: card.emoji,
      imageId: card.imageId,
      text: card.text,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffle(pairs);
}