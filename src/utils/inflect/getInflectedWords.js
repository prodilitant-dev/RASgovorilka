// src/utils/inflect/getInflectedWords.js
import { prepMap, verbCaseMap } from './dictionaries';
import { getNounGender } from './getNounGender';
import { inflectNumber } from './inflectNumber';

const DOUBLE_VERBS = [
  'дай',
  'дать',
  'давать',
  'подай',
  'подать',
  'принеси',
  'принести',
  'покажи',
  'показать',
];

/**
 * Ищет ближайший глагол или предлог слева, пропуская промежуточные слова.
 *
 * Поддерживает многословные карточки: «не хочу» разбивается на «не» + «хочу»,
 * глагол «хочу» находится в verbCaseMap → применяется accusative.
 *
 * @returns {{ type: 'prep'|'verb', caseKey: string, verb?: string } | null}
 */
function findCaseSource(wordsArray, i) {
  for (let j = i - 1; j >= 0; j--) {
    const text = wordsArray[j].text.trim().toLowerCase();
    const subwords = text.split(/\s+/);
    // Идём по под-словам справа налево — глагол/предлог обычно в конце
    for (let k = subwords.length - 1; k >= 0; k--) {
      const sub = subwords[k];
      if (prepMap[sub]) {
        return { type: 'prep', caseKey: prepMap[sub] };
      }
      if (verbCaseMap[sub]) {
        return { type: 'verb', caseKey: verbCaseMap[sub], verb: sub };
      }
    }
  }
  return null;
}

export function getInflectedWords(wordsArray, autoInflect) {
  if (!autoInflect) return wordsArray.map((w) => w.text || '');

  const result = [];
  for (let i = 0; i < wordsArray.length; i++) {
    const w = wordsArray[i];

    // ===== Числительные =====
    const num = parseInt(w.text, 10);
    if (!isNaN(num) && num >= 0 && num <= 20 && String(num) === w.text.trim()) {
      const source = findCaseSource(wordsArray, i);
      let caseKey = 'nominative';
      if (source) {
        caseKey = source.caseKey;
        if (source.type === 'verb' && DOUBLE_VERBS.includes(source.verb)) {
          caseKey = 'accusative';
        }
      }
      let gender = 'masculine';
      if (i + 1 < wordsArray.length && wordsArray[i + 1].wordType === 'noun') {
        const nounGender = getNounGender(wordsArray[i + 1].text);
        if (nounGender) gender = nounGender;
      }
      result.push(inflectNumber(num, gender, caseKey));
      continue;
    }

    // ===== Несклоняемые части речи =====
    if (
      !w.wordType ||
      (w.wordType !== 'noun' && w.wordType !== 'pronoun' && w.wordType !== 'adjective')
    ) {
      result.push(w.text || '');
      continue;
    }

    // ===== Формы есть — используем (в т.ч. многословные) =====
    if (w.forms) {
      const source = findCaseSource(wordsArray, i);
      let caseKey = 'nominative';
      if (source) {
        caseKey = source.caseKey;
        if (source.type === 'verb' && DOUBLE_VERBS.includes(source.verb)) {
          caseKey = w.animate === true ? 'dative' : 'accusative';
        }
      }

      if (w.wordType === 'noun' || w.wordType === 'pronoun') {
        result.push(w.forms[caseKey] || w.forms.nominative || w.text);
        continue;
      }

      if (w.wordType === 'adjective') {
        let nounIndex = -1;
        for (let j = i + 1; j < wordsArray.length; j++) {
          if (wordsArray[j].wordType === 'noun') {
            nounIndex = j;
            break;
          }
        }
        if (nounIndex === -1) {
          for (let j = i - 1; j >= 0; j--) {
            if (wordsArray[j].wordType === 'noun') {
              nounIndex = j;
              break;
            }
          }
        }
        let gender = 'masculine';
        if (nounIndex !== -1) {
          const g = getNounGender(wordsArray[nounIndex].text);
          if (g) gender = g;
        }
        const gf = w.forms[gender];
        if (gf) {
          result.push(gf[caseKey] || gf.nominative || w.text);
        } else {
          result.push(w.text);
        }
        continue;
      }
    }

    // ===== Нет форм — как есть =====
    result.push(w.text);
  }
  return result;
}
