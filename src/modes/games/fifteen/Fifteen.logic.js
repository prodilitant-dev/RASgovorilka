// src/modes/games/fifteen/Fifteen.logic.js
import { shuffle } from '@utils/array';

/**
 * Генерирует доску для игры "Пятнашки" (только числовой режим)
 * @param {number} size - размер доски (например, 4 для 4x4)
 * @returns {Object} { values: массив чисел (последний элемент null — пустая ячейка), emptyIndex }
 */
export function generateFifteenBoard(size) {
  const total = size * size;
  // Числа от 1 до total-1, последняя ячейка — null (пустая)
  const values = Array.from({ length: total - 1 }, (_, i) => i + 1);
  values.push(null);

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
 * @param {Array<number|null>} board
 * @param {number} size
 * @returns {boolean}
 */
function isSolvable(board, size) {
  const flat = board.filter(v => v !== null);

  let inversions = 0;
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) inversions++;
    }
  }

  const blankRow = Math.floor(board.indexOf(null) / size);
  if (size % 2 === 0) {
    const rowFromBottom = size - blankRow;
    if (rowFromBottom % 2 === 0) {
      return inversions % 2 === 1;
    }
    return inversions % 2 === 0;
  }
  return inversions % 2 === 0;
}