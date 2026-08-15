// src/utils/inflect/inflectNumber.js

/**
 * Возвращает форму числительного в нужном падеже и роде
 * Поддерживаются числа 1-4, для 5+ возвращается строка числа
 * @param {number} num - число
 * @param {string} gender - 'masculine', 'feminine', 'neuter' (для 1,2)
 * @param {string} caseKey - падеж (nominative, genitive, ...)
 * @returns {string}
 */
export function inflectNumber(num, gender, caseKey) {
  const numStr = String(num);
  const numberForms = {
    1: {
      masculine: { nominative: 'один', genitive: 'одного', dative: 'одному', accusative: 'один', instrumental: 'одним', prepositional: 'одном' },
      feminine:  { nominative: 'одна', genitive: 'одной', dative: 'одной', accusative: 'одну', instrumental: 'одной', prepositional: 'одной' },
      neuter:    { nominative: 'одно', genitive: 'одного', dative: 'одному', accusative: 'одно', instrumental: 'одним', prepositional: 'одном' }
    },
    2: {
      masculine: { nominative: 'два', genitive: 'двух', dative: 'двум', accusative: 'два', instrumental: 'двумя', prepositional: 'двух' },
      feminine:  { nominative: 'две', genitive: 'двух', dative: 'двум', accusative: 'две', instrumental: 'двумя', prepositional: 'двух' },
      neuter:    { nominative: 'два', genitive: 'двух', dative: 'двум', accusative: 'два', instrumental: 'двумя', prepositional: 'двух' }
    },
    3: {
      common: { nominative: 'три', genitive: 'трёх', dative: 'трём', accusative: 'три', instrumental: 'тремя', prepositional: 'трёх' }
    },
    4: {
      common: { nominative: 'четыре', genitive: 'четырёх', dative: 'четырём', accusative: 'четыре', instrumental: 'четырьмя', prepositional: 'четырёх' }
    }
  };

  if (num >= 1 && num <= 4) {
    const forms = numberForms[num];
    if (!forms) return numStr;
    let formSet;
    if (num === 1 || num === 2) {
      const g = gender || 'masculine';
      formSet = forms[g] || forms['masculine'];
    } else {
      formSet = forms.common;
    }
    return formSet[caseKey] || formSet.nominative || numStr;
  }
  return numStr;
}