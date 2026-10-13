// src/utils/inflect/inflectAdjective.js

/**
 * Притяжательные прилагательные — склоняются по особой парадигме
 * (лисий → лисьего, собачий → собачьего).
 * Определяются только по словарю — без словаря `-ий` от `-ий` не отличить.
 */
const POSSESSIVE_ADJECTIVES = new Set([
  'лисий',
  'собачий',
  'волчий',
  'кошачий',
  'медвежий',
  'заячий',
  'птичий',
  'рыбий',
  'казачий',
  'помещичий',
  'охотничий',
  'разбойничий',
  'ребячий',
  'девичий',
  'козий',
  'овечий',
  'коровий',
  'барсучий',
  'беличий',
  'черепаший',
  'лягушачий',
  'тюлений',
  'соболий',
  'кроличий',
  'пастуший',
  'божий',
  'вдовий',
  'вороний',
  'сорочий',
]);

/** Шипящие и заднеязычные, после которых прилагательные — смешанного типа. */
const SHIBILANTS = ['г', 'к', 'х', 'ж', 'ш', 'ч', 'щ'];

/**
 * Определяет основу прилагательного и её тип.
 * @param {string} word - прилагательное в м.р. Им. падеже (например, «Красный»)
 * @returns {{ stem: string, type: string, nomEnding: string }}
 */
function detectStem(word) {
  const lower = word.toLowerCase();

  // Притяжательные — по словарю
  if (POSSESSIVE_ADJECTIVES.has(lower)) {
    return { stem: word.slice(0, -2), type: 'possessive', nomEnding: 'ий' };
  }

  // Ударная твёрдая: большой, молодой, золотой
  if (lower.endsWith('ой')) {
    return { stem: word.slice(0, -2), type: 'hard', nomEnding: 'ой' };
  }

  // Твёрдая: красный, добрый
  if (lower.endsWith('ый')) {
    return { stem: word.slice(0, -2), type: 'hard', nomEnding: 'ый' };
  }

  // На -ий — мягкая или смешанная
  if (lower.endsWith('ий')) {
    const stem = word.slice(0, -2);
    const beforeI = lower.slice(-3, -2);
    if (SHIBILANTS.includes(beforeI)) {
      return { stem, type: 'mixed', nomEnding: 'ий' };
    }
    return { stem, type: 'soft', nomEnding: 'ий' };
  }

  // Fallback — твёрдая
  return { stem: word, type: 'hard', nomEnding: 'ый' };
}

/**
 * Парадигмы окончаний по типам основ.
 * Для твёрдой м.р. Им./Вин. окончание берётся из nomEnding (может быть -ый или -ой).
 */
const PARADIGMS = {
  hard: {
    masculine: {
      nominative: 'ый',
      genitive: 'ого',
      dative: 'ому',
      accusative: 'ый',
      instrumental: 'ым',
      prepositional: 'ом',
    },
    feminine: {
      nominative: 'ая',
      genitive: 'ой',
      dative: 'ой',
      accusative: 'ую',
      instrumental: 'ой',
      prepositional: 'ой',
    },
    neuter: {
      nominative: 'ое',
      genitive: 'ого',
      dative: 'ому',
      accusative: 'ое',
      instrumental: 'ым',
      prepositional: 'ом',
    },
  },
  soft: {
    masculine: {
      nominative: 'ий',
      genitive: 'его',
      dative: 'ему',
      accusative: 'ий',
      instrumental: 'им',
      prepositional: 'ем',
    },
    feminine: {
      nominative: 'яя',
      genitive: 'ей',
      dative: 'ей',
      accusative: 'юю',
      instrumental: 'ей',
      prepositional: 'ей',
    },
    neuter: {
      nominative: 'ее',
      genitive: 'его',
      dative: 'ему',
      accusative: 'ее',
      instrumental: 'им',
      prepositional: 'ем',
    },
  },
  mixed: {
    masculine: {
      nominative: 'ий',
      genitive: 'ого',
      dative: 'ому',
      accusative: 'ий',
      instrumental: 'им',
      prepositional: 'ом',
    },
    feminine: {
      nominative: 'ая',
      genitive: 'ой',
      dative: 'ой',
      accusative: 'ую',
      instrumental: 'ой',
      prepositional: 'ой',
    },
    neuter: {
      nominative: 'ое',
      genitive: 'ого',
      dative: 'ому',
      accusative: 'ое',
      instrumental: 'им',
      prepositional: 'ом',
    },
  },
  possessive: {
    masculine: {
      nominative: 'ий',
      genitive: 'ьего',
      dative: 'ьему',
      accusative: 'ий',
      instrumental: 'ьим',
      prepositional: 'ьем',
    },
    feminine: {
      nominative: 'ья',
      genitive: 'ьей',
      dative: 'ьей',
      accusative: 'ью',
      instrumental: 'ьей',
      prepositional: 'ьей',
    },
    neuter: {
      nominative: 'ье',
      genitive: 'ьего',
      dative: 'ьему',
      accusative: 'ье',
      instrumental: 'ьим',
      prepositional: 'ьем',
    },
  },
};

/**
 * Генерирует падежные формы прилагательного в указанном роде.
 *
 * Вин. падеж м.р. — неодушевлённая форма (= Им.).
 * Одушевлённая форма (= Род.) применяется в контексте через getInflectedWords.
 *
 * @param {string} word - прилагательное в м.р. Им. падеже (например, «Красный»)
 * @param {string} gender - 'masculine' | 'feminine' | 'neuter'
 * @returns {Object|null} { nominative, genitive, dative, accusative, instrumental, prepositional }
 */
export function inflectAdjective(word, gender) {
  if (!word) return null;
  const w = word.trim();
  if (!w) return null;

  const { stem, type, nomEnding } = detectStem(w);
  const paradigm = PARADIGMS[type]?.[gender];
  if (!paradigm) return null;

  const forms = {};
  for (const caseKey in paradigm) {
    let ending = paradigm[caseKey];
    // Твёрдая м.р.: Им. и Вин. используют окончание исходного слова (-ый или -ой)
    if (
      type === 'hard' &&
      gender === 'masculine' &&
      (caseKey === 'nominative' || caseKey === 'accusative')
    ) {
      ending = nomEnding;
    }
    forms[caseKey] = stem + ending;
  }
  return forms;
}
