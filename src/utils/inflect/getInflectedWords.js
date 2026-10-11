// src/utils/inflect/getInflectedWords.js
import { prepMap, verbCaseMap } from './dictionaries';
import { getNounGender } from './getNounGender';
import { inflectNumber } from './inflectNumber';

export function getInflectedWords(wordsArray, autoInflect) {
  if (!autoInflect) return wordsArray.map(w => w.text || '');

  const result = [];
  for (let i = 0; i < wordsArray.length; i++) {
    const w = wordsArray[i];

    // ===== Числительные =====
    const num = parseInt(w.text, 10);
    if (!isNaN(num) && num >= 0 && num <= 20 && String(num) === w.text.trim()) {
      let caseKey = 'nominative';
      if (i > 0) {
        const prev = wordsArray[i - 1].text.trim().toLowerCase();
        if (prepMap[prev]) caseKey = prepMap[prev];
      }
      let gender = 'masculine';
      if (i + 1 < wordsArray.length && wordsArray[i + 1].wordType === 'noun') {
        const nextNoun = wordsArray[i + 1];
        const nounGender = getNounGender(nextNoun.text);
        if (nounGender) gender = nounGender;
      }
      const inflectedNum = inflectNumber(num, gender, caseKey);
      result.push(inflectedNum);
      continue;
    }

    // ===== Остальные части речи =====
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

    // Определяем падеж по предыдущему слову
    let caseKey = 'nominative';
    if (i > 0) {
      const prevText = wordsArray[i - 1].text.trim().toLowerCase();
      if (prepMap[prevText]) {
        caseKey = prepMap[prevText];
      } else if (verbCaseMap[prevText]) {
        caseKey = verbCaseMap[prevText];

        const DOUBLE_VERBS = [
          'дай', 'дать', 'давать',
          'подай', 'подать',
          'принеси', 'принести',
          'покажи', 'показать',
        ];
        if (DOUBLE_VERBS.includes(prevText)) {
          caseKey = w.animate === true ? 'dative' : 'accusative';
        }
      }
    }

    if (w.wordType === 'noun' || w.wordType === 'pronoun') {
      const form = w.forms[caseKey] || w.forms.nominative || w.text;
      result.push(form);
    } else if (w.wordType === 'adjective') {
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
        const nounWord = wordsArray[nounIndex];
        const nounGender = getNounGender(nounWord.text);
        if (nounGender) gender = nounGender;
      }
      const genderForms = w.forms[gender];
      if (genderForms) {
        const form = genderForms[caseKey] || genderForms.nominative || w.text;
        result.push(form);
      } else {
        result.push(w.text);
      }
    } else {
      result.push(w.text);
    }
  }
  return result;
}