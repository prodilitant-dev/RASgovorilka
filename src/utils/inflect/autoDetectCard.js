// src/utils/inflect/autoDetectCard.js
import { guessWordType } from './guessWordType';
import { guessAnimate } from './guessAnimate';
import { inflectNoun } from './inflectNoun';
import { inflectAdjective } from './inflectAdjective';

/**
 * Заполняет поля wordType, animate, forms в карточке, если они ещё не заданы или если formsEdited = false
 * @param {Object} card - объект карточки
 * @param {string} catType - тип категории (может переопределить wordType)
 */
export function autoDetectCard(card, catType) {
  const text = card.text.trim();
  if (!text) return;
  // Определяем тип
  const type = card.wordType || catType || guessWordType(text);
  card.wordType = type;

  // Если есть флаг ручной правки, не трогаем формы (но всё равно обновляем тип)
  if (card.formsEdited) {
    return;
  }

  if (type === 'noun' || type === 'pronoun') {
    const animate = (card.animate !== undefined) ? card.animate : guessAnimate(text);
    card.animate = animate;
    const forms = inflectNoun(text, animate);
    if (forms) card.forms = forms;
  } else if (type === 'adjective') {
    const masc = inflectAdjective(text, 'masculine');
    const fem = inflectAdjective(text, 'feminine');
    const neut = inflectAdjective(text, 'neuter');
    if (masc && fem && neut) {
      card.forms = { masculine: masc, feminine: fem, neuter: neut };
    }
  } else {
    card.forms = null;
  }
}