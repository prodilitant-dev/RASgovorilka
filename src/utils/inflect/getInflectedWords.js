// src/utils/inflect/getInflectedWords.js
import { prepMap, verbCaseMap } from './dictionaries';
import { getNounGender } from './getNounGender';
import { inflectNumber } from './inflectNumber';

/**
 * Возвращает массив строк с правильными формами слов в контексте
 * @param {Array} wordsArray - массив объектов карточек (или объектов с text, wordType, forms)
 * @param {boolean} autoInflect - включено ли автосклонение
 * @returns {Array<string>}
 */
export function getInflectedWords(wordsArray, autoInflect) {
  if (!autoInflect) return wordsArray.map(w => w.text || '');

  const result = [];
  for (let i = 0; i < wordsArray.length; i++) {
    const w = wordsArray[i];
    // Если нет форм или это не склоняемая часть речи
    if (!w.forms || !w.wordType || (w.wordType !== 'noun' && w.wordType !== 'pronoun' && w.wordType !== 'adjective')) {
      // Проверяем, не число ли это
      const num = parseInt(w.text, 10);
      if (!isNaN(num) && num >= 0 && num <= 10) {
        let caseKey = 'nominative';
        if (i > 0) {
          const prev = wordsArray[i-1].text.trim().toLowerCase();
          if (prepMap[prev]) caseKey = prepMap[prev];
          else if (verbCaseMap[prev]) caseKey = verbCaseMap[prev];
        }
        let gender = 'masculine';
        if (i + 1 < wordsArray.length && wordsArray[i+1].wordType === 'noun') {
          const nextNoun = wordsArray[i+1];
          const nounGender = getNounGender(nextNoun.text);
          if (nounGender) gender = nounGender;
        }
        const inflectedNum = inflectNumber(num, gender, caseKey);
        result.push(inflectedNum);
      } else {
        result.push(w.text || '');
      }
      continue;
    }

    // Определяем падеж
    let caseKey = 'nominative';
    if (i > 0) {
      const prevText = wordsArray[i-1].text.trim().toLowerCase();
      if (prepMap[prevText]) {
        caseKey = prepMap[prevText];
      } else if (verbCaseMap[prevText]) {
        caseKey = verbCaseMap[prevText];
      }
    }

    // Если слово — существительное или местоимение
    if (w.wordType === 'noun' || w.wordType === 'pronoun') {
      const form = w.forms[caseKey] || w.forms.nominative || w.text;
      result.push(form);
    }
    // Если слово — прилагательное
    else if (w.wordType === 'adjective') {
      // Найти ближайшее существительное (справа или слева)
      let nounIndex = -1;
      for (let j = i+1; j < wordsArray.length; j++) {
        if (wordsArray[j].wordType === 'noun') { nounIndex = j; break; }
      }
      if (nounIndex === -1) {
        for (let j = i-1; j >= 0; j--) {
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