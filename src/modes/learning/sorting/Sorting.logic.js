// src/modes/learning/sorting/Sorting.logic.js
import { shuffle } from '@utils/array';
import { uid } from '@utils/id';
import { getCardsFromCategories } from '@utils/game/pickCards';

export function generateSortingGame(profile, settings) {
  const { categoryIds, numCards } = settings;
  if (categoryIds.length < 2) return null;

  const allCards = getCardsFromCategories(profile, categoryIds);
  if (allCards.length === 0) return null;

  // Группируем карточки по категориям
  const cardsByCategory = {};
  categoryIds.forEach(catId => {
    cardsByCategory[catId] = allCards.filter(c => c.categoryId === catId);
  });

  // Проверяем, что в каждой категории есть хотя бы одна карточка
  for (const catId of categoryIds) {
    if (cardsByCategory[catId].length === 0) return null;
  }

  // Выбираем по одной карточке из каждой категории
  let selectedCards = [];
  categoryIds.forEach(catId => {
    const catCards = cardsByCategory[catId];
    const card = catCards[Math.floor(Math.random() * catCards.length)];
    selectedCards.push({ ...card, id: uid() });
  });

  // Добираем остальные карточки случайно
  const remainingSlots = numCards - selectedCards.length;
  if (remainingSlots > 0) {
    const usedIds = new Set(selectedCards.map(c => c.id));
    const available = allCards.filter(c => !usedIds.has(c.id));
    const shuffledAvailable = shuffle(available);
    const additional = shuffledAvailable.slice(0, remainingSlots).map(c => ({ ...c, id: uid() }));
    selectedCards = selectedCards.concat(additional);
  }

  // Создаём зоны для категорий
  const zones = categoryIds.map(catId => {
    const cat = profile.categories.find(c => c.id === catId);
    return {
      categoryId: catId,
      name: cat ? cat.name : 'Без названия',
      items: [],
    };
  });

  return { cards: shuffle(selectedCards), zones };
}