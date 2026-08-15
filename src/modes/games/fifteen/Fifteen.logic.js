// src/modes/games/fifteen/Fifteen.logic.js
import { shuffle } from '@utils/array';
import { getCardsFromCategories } from '@utils/game/pickCards';

/**
 * Генерирует доску для игры "Пятнашки"
 * @param {number} size - размер доски (например, 4 для 4x4)
 * @param {string} mode - 'numbers' или 'images'
 * @param {Object} profile - профиль пользователя
 * @param {Array<string>} categoryIds - ID категорий для режима 'images'
 * @returns {Object} { values: массив значений (числа или объекты карточек), emptyIndex: индекс пустой ячейки }
 */
export function generateFifteenBoard(size, mode, profile, categoryIds) {
  const total = size * size;
  let values = [];

  if (mode === 'numbers') {
    // Числа от 1 до total-1, последняя ячейка — null (пустая)
    values = Array.from({ length: total - 1 }, (_, i) => i + 1);
    values.push(null);
  } else if (mode === 'images') {
    // Выбираем карточки из категорий
    const allCards = getCardsFromCategories(profile, categoryIds);
    if (allCards.length === 0) {
      return null;
    }
    const needed = total - 1;
    let selected = [];
    if (allCards.length < needed) {
      // Если карточек меньше, дублируем их случайным образом
      while (selected.length < needed) {
        const remaining = needed - selected.length;
        const chunk = shuffle(allCards).slice(0, Math.min(remaining, allCards.length));
        selected = selected.concat(chunk);
      }
    } else {
      selected = shuffle(allCards).slice(0, needed);
    }
    // Преобразуем в объекты с полями text, emoji, imageId
    values = selected.map(card => ({
      text: card.text,
      emoji: card.emoji,
      imageId: card.imageId,
    }));
    values.push(null); // пустая ячейка
  }

  // Перемешиваем и проверяем разрешимость
  let board = shuffle(values);
  let attempts = 0;
  while (!isSolvable(board, size) && attempts < 100) {
    board = shuffle(values);
    attempts++;
  }

  const emptyIndex = board.indexOf(null);
  return { values: board, emptyIndex };
}

/**
 * Проверяет, разрешима ли конфигурация пятнашек
 * @param {Array} board - массив значений (числа или объекты)
 * @param {number} size - размер доски
 * @returns {boolean}
 */
function isSolvable(board, size) {
  // Преобразуем в плоский массив для подсчёта инверсий
  const flat = board.filter(v => v !== null);
  const compare = (a, b) => {
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
      // Для изображений сравниваем по тексту (можно и по id, но проще по тексту)
      return (a.text || '').localeCompare(b.text || '');
    }
    return a - b;
  };

  let inversions = 0;
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (compare(flat[i], flat[j]) > 0) inversions++;
    }
  }

  const blankRow = Math.floor(board.indexOf(null) / size);
  // Для чётного размера: если пустая строка снизу (считая от 1), то инверсии должны быть нечётны
  if (size % 2 === 0) {
    const rowFromBottom = size - blankRow;
    if (rowFromBottom % 2 === 0) {
      return inversions % 2 === 1;
    } else {
      return inversions % 2 === 0;
    }
  } else {
    // Для нечётного размера: всегда чётное число инверсий
    return inversions % 2 === 0;
  }
}