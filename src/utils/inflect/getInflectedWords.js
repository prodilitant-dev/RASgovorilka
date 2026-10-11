// src/utils/inflect/getInflectedWords.js
import { prepMap, verbCaseMap } from './dictionaries';
import { getNounGender } from './getNounGender';
import { inflectNumber } from './inflectNumber';

/** Двойные глаголы: кому (Дат.) / что (Вин.) — по одушевлённости. */
const DOUBLE_VERBS = [
  'дай', 'дать', 'давать',
  'подай', 'подать',
  'принеси', 'принести',
  'покажи', 'показать',
];

/**
 * Ищет ближайший глагол или предлог слева от позиции i,
 * пропуская промежуточные слова (существительные, прилагательные).
 *
 * @returns {{ type: 'prep'|'verb', caseKey: string, verb?: string } | null}
 */
function findCaseSource(wordsArray, i) {
  for (let j = i - 1; j >= 0; j--) {
    const word = wordsArray[j].text.trim().toLowerCase();
    if (prepMap[word]) {
      return { type: 'prep', caseKey: prepMap[word] };
    }
    if (verbCaseMap[word]) {
      return { type: 'verb', caseKey: verbCaseMap[word], verb: word };
    }
  }
  return null;
}

export function getInflectedWords(wordsArray, autoInflect) {
  if (!autoInflect) return wordsArray.map(w => w.text || '');

  const result = [];
  for (let i = 0; i < wordsArray.length; i++) {
    const w = wordsArray[i];

    // ===== Числительные =====
    const num = parseInt(w.text, 10);
    if (!isNaN(num) && num >= 0 && num <= 20 && String(num) === w.text.trim()) {
      const source = findCaseSource(wordsArray, i);
      let caseKey = 'nominative';
      if (source && source.type === 'prep') {
        caseKey = source.caseKey;
      } else if (source && source.type === 'verb') {
        caseKey = source.caseKey;
        if (DOUBLE_VERBS.includes(source.verb)) {
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

    // ===== Не склоняемые части речи =====
    if (
      !w.forms ||
      !w.wordType ||
      (w.wordType !== 'noun' &&
        w.wordType !== 'pronoun' &&
        w.wordType !== 'adjective')
    ) {
      result.push(w.text || '');
      continue;
    }

    // ===== Определяем падеж по источнику слева =====
    const source = findCaseSource(wordsArray, i);
    let caseKey = 'nominative';
    if (source) {
      caseKey = source.caseKey;
      if (source.type === 'verb' && DOUBLE_VERBS.includes(source.verb)) {
        // Одушевлённое → Дат. (дай маме)
        // Неодушевлённое → Вин. (дай машинку / дай воду)
        caseKey = w.animate === true ? 'dative' : 'accusative';
      }
    }

    // ===== Существительные и местоимения =====
    if (w.wordType === 'noun' || w.wordType === 'pronoun') {
      const form = w.forms[caseKey] || w.forms.nominative || w.text;
      result.push(form);
      continue;
    }

    // ===== Прилагательные =====
    if (w.wordType === 'adjective') {
      let nounIndex = -1;
      for (let j = i + 1; j < wordsArray.length; j++) {
        if (wordsArray[j].wordType === 'noun') { nounIndex = j; break; }
      }
      if (nounIndex === -1) {
        for (let j = i - 1; j >= 0; j--) {
          if (wordsArray[j].wordType === 'noun') { nounIndex = j; break; }
        }
      }
      let gender = 'masculine';
      if (nounIndex !== -1) {
        const nounGender = getNounGender(wordsArray[nounIndex].text);
        if (nounGender) gender = nounGender;
      }

      const genderForms = w.forms[gender];
      if (genderForms) {
        result.push(genderForms[caseKey] || genderForms.nominative || w.text);
      } else {
        result.push(w.text);
      }
      continue;
    }

    result.push(w.text);
  }
  return result;
}