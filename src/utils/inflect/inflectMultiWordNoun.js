// src/utils/inflect/inflectMultiWordNoun.js
import { guessWordType } from './guessWordType';
import { guessAnimate } from './guessAnimate';
import { getNounGender } from './getNounGender';
import { inflectNoun } from './inflectNoun';
import { inflectAdjective } from './inflectAdjective';

const CASES = [
  'nominative', 'genitive', 'dative',
  'accusative', 'instrumental', 'prepositional',
];

/**
 * Приводит прилагательное к базовой форме (м.р., Им.).
 * «Скорая» → «Скорый», «Синяя» → «Синий», «Красное» → «Красный».
 */
function normalizeAdjectiveToMasculine(word) {
  if (!word) return word;
  const lower = word.toLowerCase();

  // Ж.р. Им.
  if (lower.endsWith('ая')) return word.slice(0, -2) + 'ый';
  if (lower.endsWith('яя')) return word.slice(0, -2) + 'ий';

  // Ср.р. Им.
  if (lower.endsWith('ое')) return word.slice(0, -2) + 'ый';
  if (lower.endsWith('ее')) return word.slice(0, -2) + 'ий';

  // Мн.ч. Им.
  if (lower.endsWith('ые')) return word.slice(0, -2) + 'ый';
  if (lower.endsWith('ие')) return word.slice(0, -2) + 'ий';

  // Уже похоже на м.р. Им. — не трогаем
  return word;
}

/**
 * Генерирует формы для многословного существительного.
 *
 * Пример: «Стиральная машина» →
 *   nominative:    «Стиральная машина»
 *   genitive:      «Стиральной машины»
 *   dative:        «Стиральной машине»
 *   accusative:    «Стиральную машину»
 *   instrumental:  «Стиральной машиной»
 *   prepositional: «Стиральной машине»
 *
 * @param {string} text
 * @param {boolean} [animateOverride] — если задано, переопределяет animate
 * @returns {Object|null} { nominative, genitive, ... } или null, если не удалось
 */
export function generateMultiWordForms(text, animateOverride) {
  if (!text) return null;
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const types = parts.map((p) => guessWordType(p));

  // Находим главное существительное — последнее в цепочке
  let mainIdx = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (types[i] === 'noun' || types[i] === 'pronoun') {
      mainIdx = i;
      break;
    }
  }
  if (mainIdx === -1) return null;

  const mainNoun = parts[mainIdx];
  const gender = getNounGender(mainNoun);
  const animate =
    animateOverride !== undefined ? animateOverride : guessAnimate(mainNoun);

  // Нормализуем прилагательные в м.р. Им., чтобы inflectAdjective работал
  const normalized = parts.map((p, i) =>
    types[i] === 'adjective' ? normalizeAdjectiveToMasculine(p) : p
  );

  const result = {};
  for (const caseKey of CASES) {
    const words = [];
    for (let i = 0; i < parts.length; i++) {
      const word = normalized[i];
      const type = types[i];

      if (type === 'adjective') {
        const adjForms = inflectAdjective(word, gender);
        if (adjForms) {
          let form;
          if (caseKey === 'accusative' && animate && gender === 'masculine') {
            // Одушевлённое м.р. — Вин. = Род.
            form = adjForms.genitive;
          } else {
            form = adjForms[caseKey] || adjForms.nominative;
          }
          words.push(form);
        } else {
          words.push(word);
        }
      } else if (type === 'noun' || type === 'pronoun') {
        const forms = inflectNoun(word, animate);
        if (forms) {
          words.push(forms[caseKey] || forms.nominative);
        } else {
          words.push(word);
        }
      } else {
        // Союзы, предлоги, частицы — без изменений
        words.push(word);
      }
    }
    result[caseKey] = words.join(' ');
  }

  return result;
}

/**
 * Оставляю на будущее — склонение одной фразы в конкретном падеже.
 * Не используется в текущей архитектуре (forms генерируются заранее).
 */
export function inflectMultiWordNoun(text, caseKey) {
  const forms = generateMultiWordForms(text);
  return forms ? forms[caseKey] || forms.nominative : text;
}