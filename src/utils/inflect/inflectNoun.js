// src/utils/inflect/inflectNoun.js
import { nounExceptions } from './dictionaries';
import { getNounGender } from './getNounGender';
import { guessAnimate } from './guessAnimate';

/**
 * Генерирует все шесть падежных форм для существительного
 * @param {string} word - слово в именительном падеже
 * @param {boolean} animate - одушевлённое? (если не указано, будет вычислено автоматически)
 * @returns {Object} { nominative, genitive, dative, accusative, instrumental, prepositional }
 */
export function inflectNoun(word, animate) {
  if (!word) return null;
  const w = word.trim();
  if (!w) return null;
  const lower = w.toLowerCase().replace(/ё/g, 'е');
  // Обработка исключений (включая несклоняемые)
  if (nounExceptions[lower]) {
    const forms = { nominative: w, genitive: w, dative: w, accusative: w, instrumental: w, prepositional: w };
    // Для некоторых исключений можно попытаться склонять
    if (lower === 'ребёнок') {
      forms.genitive = 'ребёнка';
      forms.dative = 'ребёнку';
      forms.accusative = animate ? forms.genitive : w;
      forms.instrumental = 'ребёнком';
      forms.prepositional = 'ребёнке';
    } else if (lower === 'человек') {
      forms.genitive = 'человека';
      forms.dative = 'человеку';
      forms.accusative = animate ? forms.genitive : w;
      forms.instrumental = 'человеком';
      forms.prepositional = 'человеке';
    } else if (lower === 'ухо') {
      forms.genitive = 'уха';
      forms.dative = 'уху';
      forms.accusative = animate ? forms.genitive : w;
      forms.instrumental = 'ухом';
      forms.prepositional = 'ухе';
    } else if (lower === 'глаз') {
      forms.genitive = 'глаза';
      forms.dative = 'глазу';
      forms.accusative = animate ? forms.genitive : w;
      forms.instrumental = 'глазом';
      forms.prepositional = 'глазе';
    } else if (lower === 'бобр') {
      forms.genitive = 'бобра';
      forms.dative = 'бобру';
      forms.accusative = animate ? forms.genitive : w;
      forms.instrumental = 'бобром';
      forms.prepositional = 'бобре';
    } else if (lower === 'ёж') {
      forms.genitive = 'ежа';
      forms.dative = 'ежу';
      forms.accusative = animate ? forms.genitive : w;
      forms.instrumental = 'ежом';
      forms.prepositional = 'еже';
    } else if (lower === 'белка') {
      forms.genitive = 'белки';
      forms.dative = 'белке';
      forms.accusative = animate ? forms.genitive : w;
      forms.instrumental = 'белкой';
      forms.prepositional = 'белке';
    } else if (lower === 'лошадь') {
      forms.genitive = 'лошади';
      forms.dative = 'лошади';
      forms.accusative = animate ? forms.genitive : w;
      forms.instrumental = 'лошадью';
      forms.prepositional = 'лошади';
    } else if (lower === 'мать') {
      forms.genitive = 'матери';
      forms.dative = 'матери';
      forms.accusative = animate ? forms.genitive : w;
      forms.instrumental = 'матерью';
      forms.prepositional = 'матери';
    } else if (lower === 'дочь') {
      forms.genitive = 'дочери';
      forms.dative = 'дочери';
      forms.accusative = animate ? forms.genitive : w;
      forms.instrumental = 'дочерью';
      forms.prepositional = 'дочери';
    } else if (lower === 'путь') {
      forms.genitive = 'пути';
      forms.dative = 'пути';
      forms.accusative = animate ? forms.genitive : w;
      forms.instrumental = 'путём';
      forms.prepositional = 'пути';
    } else if (lower.endsWith('мя')) {
      const stem = w.slice(0, -2);
      forms.genitive = stem + 'мени';
      forms.dative = stem + 'мени';
      forms.accusative = animate ? forms.genitive : w;
      forms.instrumental = stem + 'менем';
      forms.prepositional = stem + 'мени';
    }
    return forms;
  }

  const gender = getNounGender(w);
  const forms = { nominative: w };
  const last = w.slice(-1);
  const last2 = w.slice(-2);
  const isAnimate = (animate !== undefined) ? animate : guessAnimate(w);

  if (gender === 'masculine') {
    if (last === 'й') {
      const stem = w.slice(0, -1);
      forms.genitive = stem + 'я';
      forms.dative = stem + 'ю';
      forms.accusative = isAnimate ? forms.genitive : w;
      forms.instrumental = stem + 'ем';
      forms.prepositional = stem + 'е';
    } else if (last === 'ь') {
      const stem = w.slice(0, -1);
      forms.genitive = stem + 'я';
      forms.dative = stem + 'ю';
      forms.accusative = isAnimate ? forms.genitive : w;
      forms.instrumental = stem + 'ем';
      forms.prepositional = stem + 'е';
    } else {
      const stem = w;
      forms.genitive = stem + 'а';
      forms.dative = stem + 'у';
      forms.accusative = isAnimate ? forms.genitive : w;
      forms.instrumental = stem + 'ом';
      forms.prepositional = stem + 'е';
      if (w.endsWith('ец')) {
        const newStem = w.slice(0, -3);
        forms.genitive = newStem + 'ца';
        forms.dative = newStem + 'цу';
        forms.accusative = isAnimate ? forms.genitive : w;
        forms.instrumental = newStem + 'цом';
        forms.prepositional = newStem + 'це';
      } else if (w.endsWith('ок')) {
        const newStem = w.slice(0, -2);
        forms.genitive = newStem + 'ка';
        forms.dative = newStem + 'ку';
        forms.accusative = isAnimate ? forms.genitive : w;
        forms.instrumental = newStem + 'ком';
        forms.prepositional = newStem + 'ке';
      } else if (w.endsWith('ёк')) {
        const newStem = w.slice(0, -2);
        forms.genitive = newStem + 'ка';
        forms.dative = newStem + 'ку';
        forms.accusative = isAnimate ? forms.genitive : w;
        forms.instrumental = newStem + 'ком';
        forms.prepositional = newStem + 'ке';
      }
    }
  } else if (gender === 'feminine') {
    if (last === 'а') {
      const stem = w.slice(0, -1);
      const lastChar = stem.slice(-1);
      const softConsonants = ['к', 'г', 'х', 'ж', 'ш', 'ч', 'щ'];
      const genitiveEnding = softConsonants.includes(lastChar) ? 'и' : 'ы';
      forms.genitive = stem + genitiveEnding;
      forms.dative = stem + 'е';
      forms.accusative = isAnimate ? forms.genitive : stem + 'у';
      forms.instrumental = stem + 'ой';
      forms.prepositional = stem + 'е';
    } else if (last === 'я') {
      const stem = w.slice(0, -1);
      forms.genitive = stem + 'и';
      forms.dative = stem + 'е';
      forms.accusative = isAnimate ? forms.genitive : stem + 'ю';
      forms.instrumental = stem + 'ей';
      forms.prepositional = stem + 'е';
    } else if (last === 'ь') {
      const stem = w.slice(0, -1);
      forms.genitive = stem + 'и';
      forms.dative = stem + 'и';
      forms.accusative = isAnimate ? forms.genitive : w;
      forms.instrumental = stem + 'ью';
      forms.prepositional = stem + 'и';
    }
  } else if (gender === 'neuter') {
    if (last === 'о') {
      const stem = w.slice(0, -1);
      forms.genitive = stem + 'а';
      forms.dative = stem + 'у';
      forms.accusative = isAnimate ? forms.genitive : w;
      forms.instrumental = stem + 'ом';
      forms.prepositional = stem + 'е';
    } else if (last === 'е') {
      const stem = w.slice(0, -1);
      forms.genitive = stem + 'я';
      forms.dative = stem + 'ю';
      forms.accusative = isAnimate ? forms.genitive : w;
      forms.instrumental = stem + 'ем';
      forms.prepositional = stem + 'е';
    } else if (last2 === 'ие') {
      const stem = w.slice(0, -2);
      forms.genitive = stem + 'ия';
      forms.dative = stem + 'ию';
      forms.accusative = isAnimate ? forms.genitive : w;
      forms.instrumental = stem + 'ием';
      forms.prepositional = stem + 'ии';
    } else if (last === 'мя') {
      const stem = w.slice(0, -2);
      forms.genitive = stem + 'мени';
      forms.dative = stem + 'мени';
      forms.accusative = isAnimate ? forms.genitive : w;
      forms.instrumental = stem + 'менем';
      forms.prepositional = stem + 'мени';
    }
  }

  // Заполняем недостающие (если что-то не задано)
  const caseKeys = ['nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'prepositional'];
  for (let k of caseKeys) {
    if (!forms[k]) forms[k] = forms.nominative || w;
  }
  return forms;
}