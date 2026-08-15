// src/utils/inflect/guessAnimate.js
import { nounExceptions } from './dictionaries';

/**
 * Определяет одушевлённость существительного
 * @param {string} word
 * @returns {boolean}
 */
export function guessAnimate(word) {
  if (!word) return false;
  const w = word.trim().toLowerCase().replace(/ё/g, 'е');
  if (nounExceptions[w] && nounExceptions[w].animate !== undefined) return nounExceptions[w].animate;
  const animals = ['кот', 'собака', 'корова', 'бык', 'индюк', 'петух', 'курица', 'лошадь', 'баран', 'овца', 'осёл', 'свинья', 'пантера', 'панда', 'носорог', 'медведь', 'леопард', 'лиса', 'лев', 'лама', 'крыса', 'коала', 'кабан', 'кенгуру', 'заяц', 'зебра', 'енот', 'жираф', 'ёжик', 'гепард', 'змея', 'верблюд', 'волк', 'бобёр', 'белка', 'бегемот', 'обезьяна', 'черепаха', 'тюлень', 'тигр', 'слон', 'муравей', 'пчела', 'бабочка', 'комар', 'паук', 'жук'];
  const people = ['мама', 'папа', 'бабушка', 'дедушка', 'сын', 'дочь', 'брат', 'сестра', 'друг', 'подруга', 'учитель', 'ученик', 'ребёнок', 'человек', 'ребята', 'мальчик', 'девочка', 'мужчина', 'женщина', 'дедушка', 'бабушка'];
  const allAnimate = [...animals, ...people];
  if (allAnimate.some(a => w.includes(a) || a.includes(w))) return true;
  return false;
}