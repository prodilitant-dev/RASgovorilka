// src/utils/inflect/generateForms.js
import { guessWordType } from './guessWordType';
import { guessAnimate } from './guessAnimate';
import { inflectNoun } from './inflectNoun';
import { inflectAdjective } from './inflectAdjective';

/**
 * Генерирует полные падежные формы для слова в зависимости от типа
 * @param {string} word - исходное слово
 * @param {boolean} animate - для существительных (опционально)
 * @param {string} wordType - опционально, если не указан, определяется автоматически
 * @returns {Object|null} - формы или null, если не склоняется
 */
export function generateForms(word, animate, wordType) {
  if (!word) return null;
  const clean = word.trim();
  if (!clean) return null;
  const type = wordType || guessWordType(clean);
  if (type === 'noun' || type === 'pronoun') {
    const anim = animate !== undefined ? animate : guessAnimate(clean);
    return inflectNoun(clean, anim);
  } else if (type === 'adjective') {
    const masc = inflectAdjective(clean, 'masculine');
    const fem = inflectAdjective(clean, 'feminine');
    const neut = inflectAdjective(clean, 'neuter');
    return { masculine: masc, feminine: fem, neuter: neut };
  }
  return null;
}