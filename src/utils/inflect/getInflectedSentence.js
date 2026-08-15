// src/utils/inflect/getInflectedSentence.js
import { getInflectedWords } from './getInflectedWords';

/**
 * Возвращает финальную строку предложения со склонёнными словами
 * @param {Array} wordsArray - массив объектов карточек
 * @param {boolean} autoInflect - включено ли автосклонение
 * @returns {string}
 */
export function getInflectedSentence(wordsArray, autoInflect) {
  const inflected = getInflectedWords(wordsArray, autoInflect);
  return inflected.join(' ');
}