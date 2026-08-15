// src/utils/game/pickCards.js
export function getCardsFromCategories(profile, categoryIds) {
  const result = [];
  categoryIds.forEach(catId => {
    const cards = profile.cards[catId] || [];
    cards.forEach(card => {
      result.push({ ...card, categoryId: catId });
    });
  });
  return result;
}