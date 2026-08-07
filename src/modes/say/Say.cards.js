// src/modes/say/Say.cards.js
import { renderGrid } from '@components/common/Grid/Grid';
import { attachGridEvents } from '@components/common/Grid/Grid.events';
import { getState } from '@state/store';
import { uid } from '@utils/id';
import { openCardEditor } from './Say.editor';
import { saveProfile } from '@storage/appStorage';

export function renderCards(container, profile, categoryId, onCardClick, onReorder) {
  const state = getState();
  const editing = state.editingMode || false;
  const cards = profile.cards[categoryId] || [];

  const items = cards.map(c => ({ ...c }));

  if (editing) {
    // Добавляем кнопку "Добавить карточку"
    items.push({ id: 'add', text: 'Добавить', emoji: '➕', isAdd: true });
  }

  // Рендерим сетку
  const grid = renderGrid(container, items, {
    draggable: editing,
    onReorder: editing ? (newOrder) => onReorder(newOrder, categoryId) : null,
  });

  // Обработчики кликов
  const cleanup = attachGridEvents(grid, {
    onClick: (id) => {
      if (id === 'add') {
        // Создаём новую карточку
        const newCard = { id: uid(), text: '', emoji: '', wordType: 'noun', forms: {} };
        openCardEditor(newCard, (savedCard) => {
          if (!savedCard.text.trim()) { toast('Введите текст', 'error'); return; }
          profile.cards[categoryId].push(savedCard);
          saveProfile(profile);
          renderCards(container, profile, categoryId, onCardClick, onReorder);
        }, null);
        return;
      }
      // Иначе передаём клик выше
      if (onCardClick) onCardClick(id, categoryId);
    },
    onLongPress: (id) => {
      // Долгий тап — только в режиме редактирования, для редактирования карточки
      if (editing && id !== 'add') {
        const card = cards.find(c => c.id === id);
        if (card) {
          openCardEditor(card, (updatedCard) => {
            Object.assign(card, updatedCard);
            saveProfile(profile);
            renderCards(container, profile, categoryId, onCardClick, onReorder);
          }, (cardId) => {
            profile.cards[categoryId] = profile.cards[categoryId].filter(c => c.id !== cardId);
            saveProfile(profile);
            renderCards(container, profile, categoryId, onCardClick, onReorder);
          });
        }
      }
    },
  });

  // Сохраняем cleanup в контейнере для последующего удаления
  container._cardCleanup = cleanup;
}