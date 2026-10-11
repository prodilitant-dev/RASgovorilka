// src/utils/inflect/autoDetectCard.js
import { guessWordType } from './guessWordType';
import { guessAnimate } from './guessAnimate';
import { inflectNoun } from './inflectNoun';
import { inflectAdjective } from './inflectAdjective';
import { generateMultiWordForms } from './inflectMultiWordNoun';

export function autoDetectCard(card, catType) {
  const text = card.text?.trim();
  if (!text) return;

  const type = card.wordType || catType || guessWordType(text);
  card.wordType = type;

  const hasSpace = /\s/.test(text);

  if (type === 'noun' || type === 'pronoun') {
    // Для многословных animate определяем по главному (последнему)
    // существительному, а не по всей фразе.
    let animate;
    if (card.animate !== undefined) {
      animate = card.animate;
    } else if (hasSpace) {
      const parts = text.split(/\s+/);
      let mainNoun = parts[parts.length - 1];
      for (let i = parts.length - 1; i >= 0; i--) {
        const t = guessWordType(parts[i]);
        if (t === 'noun' || t === 'pronoun') {
          mainNoun = parts[i];
          break;
        }
      }
      animate = guessAnimate(mainNoun);
    } else {
      animate = guessAnimate(text);
    }
    card.animate = animate;

    if (hasSpace) {
      const multiForms = generateMultiWordForms(text, animate);
      card.forms = multiForms || null;
      return;
    }

    const forms = inflectNoun(text, animate);
    if (forms) card.forms = forms;
  } else if (type === 'adjective') {
    if (hasSpace) {
      card.forms = null;
      return;
    }
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