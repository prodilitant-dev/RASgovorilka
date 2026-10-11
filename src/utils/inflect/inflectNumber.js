// src/utils/inflect/inflectNumber.js

/**
 * Возвращает форму числительного в нужном падеже и роде.
 *
 * Поддерживаются числа 1–20.
 *   1, 2 — различаются по родам
 *   3, 4 — общие формы (род не важен)
 *   5–20 — общие формы
 *
 * Для чисел вне диапазона возвращается строка числа как есть.
 *
 * @param {number} num
 * @param {string} gender — 'masculine' | 'feminine' | 'neuter' (для 1 и 2)
 * @param {string} caseKey — nominative | genitive | dative | accusative | instrumental | prepositional
 * @returns {string}
 */
export function inflectNumber(num, gender, caseKey) {
  const numStr = String(num);

  const numberForms = {
    // === 1 ===
    1: {
      masculine: {
        nominative: 'один',   genitive: 'одного',  dative: 'одному',
        accusative: 'один',   instrumental: 'одним', prepositional: 'одном',
      },
      feminine: {
        nominative: 'одна',   genitive: 'одной',   dative: 'одной',
        accusative: 'одну',   instrumental: 'одной', prepositional: 'одной',
      },
      neuter: {
        nominative: 'одно',   genitive: 'одного',  dative: 'одному',
        accusative: 'одно',   instrumental: 'одним', prepositional: 'одном',
      },
    },

    // === 2 ===
    2: {
      masculine: {
        nominative: 'два',    genitive: 'двух',    dative: 'двум',
        accusative: 'два',    instrumental: 'двумя', prepositional: 'двух',
      },
      feminine: {
        nominative: 'две',    genitive: 'двух',    dative: 'двум',
        accusative: 'две',    instrumental: 'двумя', prepositional: 'двух',
      },
      neuter: {
        nominative: 'два',    genitive: 'двух',    dative: 'двум',
        accusative: 'два',    instrumental: 'двумя', prepositional: 'двух',
      },
    },

    // === 3 ===
    3: {
      common: {
        nominative: 'три',    genitive: 'трёх',    dative: 'трём',
        accusative: 'три',    instrumental: 'тремя', prepositional: 'трёх',
      },
    },

    // === 4 ===
    4: {
      common: {
        nominative: 'четыре', genitive: 'четырёх', dative: 'четырём',
        accusative: 'четыре', instrumental: 'четырьмя', prepositional: 'четырёх',
      },
    },

    // === 5–20 (общие формы) ===
    5: {
      common: {
        nominative: 'пять',    genitive: 'пяти',    dative: 'пяти',
        accusative: 'пять',    instrumental: 'пятью', prepositional: 'пяти',
      },
    },
    6: {
      common: {
        nominative: 'шесть',   genitive: 'шести',   dative: 'шести',
        accusative: 'шесть',   instrumental: 'шестью', prepositional: 'шести',
      },
    },
    7: {
      common: {
        nominative: 'семь',    genitive: 'семи',    dative: 'семи',
        accusative: 'семь',    instrumental: 'семью', prepositional: 'семи',
      },
    },
    8: {
      common: {
        nominative: 'восемь',  genitive: 'восьми',  dative: 'восьми',
        accusative: 'восемь',  instrumental: 'восемью', prepositional: 'восьми',
      },
    },
    9: {
      common: {
        nominative: 'девять',  genitive: 'девяти',  dative: 'девяти',
        accusative: 'девять',  instrumental: 'девятью', prepositional: 'девяти',
      },
    },
    10: {
      common: {
        nominative: 'десять',  genitive: 'десяти',  dative: 'десяти',
        accusative: 'десять',  instrumental: 'десятью', prepositional: 'десяти',
      },
    },
    11: {
      common: {
        nominative: 'одиннадцать', genitive: 'одиннадцати', dative: 'одиннадцати',
        accusative: 'одиннадцать', instrumental: 'одиннадцатью', prepositional: 'одиннадцати',
      },
    },
    12: {
      common: {
        nominative: 'двенадцать', genitive: 'двенадцати', dative: 'двенадцати',
        accusative: 'двенадцать', instrumental: 'двенадцатью', prepositional: 'двенадцати',
      },
    },
    13: {
      common: {
        nominative: 'тринадцать', genitive: 'тринадцати', dative: 'тринадцати',
        accusative: 'тринадцать', instrumental: 'тринадцатью', prepositional: 'тринадцати',
      },
    },
    14: {
      common: {
        nominative: 'четырнадцать', genitive: 'четырнадцати', dative: 'четырнадцати',
        accusative: 'четырнадцать', instrumental: 'четырнадцатью', prepositional: 'четырнадцати',
      },
    },
    15: {
      common: {
        nominative: 'пятнадцать', genitive: 'пятнадцати', dative: 'пятнадцати',
        accusative: 'пятнадцать', instrumental: 'пятнадцатью', prepositional: 'пятнадцати',
      },
    },
    16: {
      common: {
        nominative: 'шестнадцать', genitive: 'шестнадцати', dative: 'шестнадцати',
        accusative: 'шестнадцать', instrumental: 'шестнадцатью', prepositional: 'шестнадцати',
      },
    },
    17: {
      common: {
        nominative: 'семнадцать', genitive: 'семнадцати', dative: 'семнадцати',
        accusative: 'семнадцать', instrumental: 'семнадцатью', prepositional: 'семнадцати',
      },
    },
    18: {
      common: {
        nominative: 'восемнадцать', genitive: 'восемнадцати', dative: 'восемнадцати',
        accusative: 'восемнадцать', instrumental: 'восемнадцатью', prepositional: 'восемнадцати',
      },
    },
    19: {
      common: {
        nominative: 'девятнадцать', genitive: 'девятнадцати', dative: 'девятнадцати',
        accusative: 'девятнадцать', instrumental: 'девятнадцатью', prepositional: 'девятнадцати',
      },
    },
    20: {
      common: {
        nominative: 'двадцать', genitive: 'двадцати', dative: 'двадцати',
        accusative: 'двадцать', instrumental: 'двадцатью', prepositional: 'двадцати',
      },
    },
  };

  if (num >= 1 && num <= 20) {
    const forms = numberForms[num];
    if (!forms) return numStr;

    let formSet;
    if (num === 1 || num === 2) {
      const g = gender || 'masculine';
      formSet = forms[g] || forms.masculine;
    } else {
      formSet = forms.common;
    }

    return formSet[caseKey] || formSet.nominative || numStr;
  }

  return numStr;
}