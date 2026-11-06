// src/modes/say/utils/CategoryPresets.js
import { uid } from '@utils/id';
import { autoDetectCard } from '@utils/inflect';
import { confirm } from '@utils/dialog';
import { CARD_BANK } from '@config/cardBank';
import { KNOWN_CATEGORIES } from '@config/defaultData/categories';

/**
 * Проверяет, есть ли для новой категории готовые карточки в банке.
 * Если есть — спрашивает пользователя и возвращает массив карточек.
 */
export async function applyStandardCards(categoryName, categoryWordType) {
  const matchedCategory = KNOWN_CATEGORIES.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (!matchedCategory) return { cards: [], added: false };

  const stockCards = CARD_BANK.filter(
    (item) => item.category.toLowerCase() === matchedCategory.id.toLowerCase()
  );

  if (stockCards.length === 0) return { cards: [], added: false };

  const ok = await confirm(
    `В приложении есть готовые карточки для категории «${matchedCategory.name}» (${stockCards.length} шт.). Добавить их?`,
    'Стандартные карточки'
  );

  if (!ok) return { cards: [], added: false };

  const cards = stockCards.map((raw) => {
    const card = {
      id: uid(),
      text: raw.word.charAt(0).toUpperCase() + raw.word.slice(1),
      emoji: raw.emoji || '🖼️',
      wordType: raw.wordType || categoryWordType,
      gender: raw.gender || null,
      animate: false,
      imageId: null,
      imagePath: `cards/${raw.category}/${raw.filename || raw.word + '.webp'}`,
      forms: null,
      variants: raw.variants || [],
    };

    if (['noun', 'pronoun', 'adjective'].includes(card.wordType)) {
      autoDetectCard(card);
    }
    return card;
  });

  return { cards, added: true };
}
