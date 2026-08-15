// src/utils/inflect/guessWordType.js
import { nounExceptions, adjEndings, verbEndings, pronouns, prepMap } from './dictionaries';

/**
 * Определяет тип слова: noun, pronoun, adjective, verb, preposition, other
 * @param {string} word
 * @returns {string}
 */
export function guessWordType(word) {
  if (!word) return 'other';
  const w = word.trim().toLowerCase().replace(/ё/g, 'е');
  if (!w) return 'other';
  if (pronouns.includes(w)) return 'pronoun';
  if (prepMap[w] !== undefined) return 'preposition';
  if (nounExceptions[w]) return nounExceptions[w].type;
  for (let ending of adjEndings) {
    if (w.endsWith(ending)) return 'adjective';
  }
  for (let ending of verbEndings) {
    if (w.endsWith(ending)) return 'verb';
  }
  // Если не подошло — возвращаем noun (по умолчанию)
  return 'noun';
}