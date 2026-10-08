// src/modes/games/memory/Memory.logic.js
import { shuffle } from '@utils/array';
import { getCardsFromCategories } from '@utils/game/pickCards';
import { uid } from '@utils/id';

/**
 * Генерирует пары карточек для игры Мемори.
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
      imagePath: card.imagePath,   // ← NEW
      text: card.text,
      isFlipped: false,
      isMatched: false,
    });
    pairs.push({
      id: uid(),
      pairId: pairId,
      emoji: card.emoji,
      imageId: card.imageId,
      imagePath: card.imagePath,   // ← NEW
      text: card.text,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffle(pairs);
}