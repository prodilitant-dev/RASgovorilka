// src/utils/inflect/getNounGender.js
import { nounExceptions } from './dictionaries';

/**
 * Определяет род существительного: masculine, feminine, neuter
 * @param {string} word
 * @returns {string}
 */
export function getNounGender(word) {
  const w = word.trim().toLowerCase().replace(/ё/g, 'е');
  if (nounExceptions[w]) return nounExceptions[w].gender;
  const last = w.slice(-1);
  if (last === 'а' || last === 'я') return 'feminine';
  if (last === 'о' || last === 'е') return 'neuter';
  if (last === 'ь') {
    const feminineExceptions = ['ночь', 'рожь', 'мышь', 'печь', 'брошь', 'тишь', 'глушь', 'дверь', 'кровать', 'любовь', 'смерть', 'осень', 'лань', 'тень', 'степь', 'цепь', 'мысль', 'часть', 'власть', 'жизнь', 'речь', 'помощь', 'вещь', 'болезнь'];
    return feminineExceptions.includes(w) ? 'feminine' : 'masculine';
  }
  return 'masculine';
}