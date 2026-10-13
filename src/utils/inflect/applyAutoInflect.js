// src/utils/inflect/applyAutoInflect.js
import { fillEmptyForms } from './fillEmptyForms';
import { logger } from '@utils/logger';

/**
 * Проходит по всем карточкам профиля и заполняет пустые падежные формы.
 * Уже заполненные поля не трогает.
 *
 * @param {Object} profile - профиль (мутируется на месте)
 * @returns {{ totalFilled: number, cardsProcessed: number }}
 */
export function applyAutoInflectToAllCards(profile) {
  if (!profile || !profile.cards) {
    return { totalFilled: 0, cardsProcessed: 0 };
  }

  let totalFilled = 0;
  let cardsProcessed = 0;

  for (const categoryId in profile.cards) {
    const cards = profile.cards[categoryId] || [];
    cards.forEach((card) => {
      const { filled } = fillEmptyForms(card);
      if (filled > 0) {
        totalFilled += filled;
        cardsProcessed++;
      }
    });
  }

  logger.debug(`Auto-inflect: заполнено ${totalFilled} форм в ${cardsProcessed} карточках`);

  return { totalFilled, cardsProcessed };
}
