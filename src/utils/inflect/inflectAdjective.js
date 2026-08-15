// src/utils/inflect/inflectAdjective.js
import { adjEndings } from './dictionaries';

/**
 * Генерирует падежные формы для прилагательного в указанном роде
 * @param {string} word - прилагательное в именительном падеже (мужской род)
 * @param {string} gender - 'masculine', 'feminine', 'neuter'
 * @returns {Object} { nominative, genitive, dative, accusative, instrumental, prepositional }
 */
export function inflectAdjective(word, gender) {
  if (!word) return null;
  const w = word.trim();
  const lower = w.toLowerCase();
  let stem = w;
  for (let ending of adjEndings) {
    if (lower.endsWith(ending)) {
      stem = w.slice(0, -ending.length);
      break;
    }
  }
  if (!stem) stem = w;
  const endings = {
    masculine: { nominative: 'ый', genitive: 'ого', dative: 'ому', accusative: 'ый', instrumental: 'ым', prepositional: 'ом' },
    feminine: { nominative: 'ая', genitive: 'ой', dative: 'ой', accusative: 'ую', instrumental: 'ой', prepositional: 'ой' },
    neuter: { nominative: 'ое', genitive: 'ого', dative: 'ому', accusative: 'ое', instrumental: 'ым', prepositional: 'ом' }
  };
  const pattern = endings[gender] || endings.masculine;
  const forms = {};
  for (let caseKey in pattern) {
    forms[caseKey] = stem + pattern[caseKey];
  }
  return forms;
}