// src/utils/inflect/fillEmptyForms.js
import { autoDetectCard } from './autoDetectCard';
import { inflectNoun } from './inflectNoun';
import { inflectAdjective } from './inflectAdjective';

/**
 * Проверка «пустое ли значение формы».
 * Пустое = null, undefined, или строка из пробелов/пустая.
 */
function isEmpty(val) {
  if (val === null || val === undefined) return true;
  if (typeof val !== 'string') return false;
  return val.trim() === '';
}

/**
 * Заполняет ТОЛЬКО пустые падежные формы карточки.
 * Уже заполненные поля не трогает.
 *
 * Поддерживает:
 * - существительные и местоимения (плоская структура)
 * - прилагательные (вложенная по родам)
 *
 * @param {Object} card - карточка (мутируется на месте)
 * @returns {{ filled: number }} — сколько полей заполнено
 */
export function fillEmptyForms(card) {
  if (!card) return { filled: 0 };

  const type = card.wordType;
  if (type !== 'noun' && type !== 'pronoun' && type !== 'adjective') {
    return { filled: 0 };
  }

  // Определяем «эталонные» формы — из эвристики
  let referenceForms = null;

  if (type === 'noun' || type === 'pronoun') {
    // Временно убираем формы, чтобы autoDetectCard сгенерировал полный набор
    const backup = card.forms;
    card.forms = null;
    autoDetectCard(card);
    referenceForms = card.forms;
    card.forms = backup;
  } else if (type === 'adjective') {
    // Для прилагательных генерируем формы для всех родов
    const text = card.text;
    if (!text) return { filled: 0 };
    referenceForms = {
      masculine: inflectAdjective(text, 'masculine'),
      feminine: inflectAdjective(text, 'feminine'),
      neuter: inflectAdjective(text, 'neuter'),
    };
  }

  if (!referenceForms) return { filled: 0 };

  // Если у карточки вообще нет forms — берём reference целиком
  if (!card.forms) {
    card.forms = JSON.parse(JSON.stringify(referenceForms));
    return { filled: countForms(card.forms, type) };
  }

  // Заполняем только пустые поля
  let filled = 0;

  if (type === 'noun' || type === 'pronoun') {
    for (const caseKey in referenceForms) {
      if (isEmpty(card.forms[caseKey]) && !isEmpty(referenceForms[caseKey])) {
        card.forms[caseKey] = referenceForms[caseKey];
        filled++;
      }
    }
  } else if (type === 'adjective') {
    for (const gender in referenceForms) {
      const refGenderForms = referenceForms[gender];
      if (!refGenderForms) continue;

      if (!card.forms[gender]) {
        // Целый род отсутствует — копируем весь
        card.forms[gender] = JSON.parse(JSON.stringify(refGenderForms));
        filled += Object.values(refGenderForms).filter((v) => !isEmpty(v)).length;
      } else {
        for (const caseKey in refGenderForms) {
          if (
            isEmpty(card.forms[gender][caseKey]) &&
            !isEmpty(refGenderForms[caseKey])
          ) {
            card.forms[gender][caseKey] = refGenderForms[caseKey];
            filled++;
          }
        }
      }
    }
  }

  return { filled };
}

function countForms(forms, type) {
  let count = 0;
  if (type === 'noun' || type === 'pronoun') {
    for (const key in forms) {
      if (!isEmpty(forms[key])) count++;
    }
  } else if (type === 'adjective') {
    for (const gender in forms) {
      for (const key in forms[gender]) {
        if (!isEmpty(forms[gender][key])) count++;
      }
    }
  }
  return count;
}