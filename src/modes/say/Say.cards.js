// src/modes/say/Say.cards.js
import { renderGrid } from '@components/common/Grid/Grid';
import { attachGridEvents } from '@components/common/Grid/Grid.events';
import { getState } from '@state/store';
import { uid } from '@utils/id';
import { toast } from '@utils/toast';
import { openCardEditor } from './Say.editor';
import { saveProfile } from '@storage/appStorage';

export function renderCards(container, profile, categoryId, onCardClick, onReorder) {
  const state = getState();
  const editing = state.editingMode || false;
  const cards = profile.cards[categoryId] || [];

  const items = cards.map(c => ({ ...c }));

  if (editing) {
    items.push({ id: 'add', text: 'Добавить', emoji: '➕', isAdd: true });
  }

  const grid = renderGrid(container, items, {
    draggable: editing,
    onReorder: editing ? (newOrder) => onReorder(newOrder, categoryId) : null,
  });

  // Общая функция для открытия редактора карточки
  function editCard(card) {
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

  const cleanup = attachGridEvents(grid, {
    onClick: (id) => {
      if (id === 'add') {
        // Создание новой карточки
        const newCard = { id: uid(), text: '', emoji: '', wordType: 'noun', forms: {} };
        openCardEditor(newCard, (savedCard) => {
          if (!savedCard.text.trim()) { toast('Введите текст', 'error'); return; }
          profile.cards[categoryId].push(savedCard);
          saveProfile(profile);
          renderCards(container, profile, categoryId, onCardClick, onReorder);
        }, null);
        return;
      }

      if (editing) {
        // В режиме редактирования — открываем редактор по клику
        const card = cards.find(c => c.id === id);
        if (card) {
          editCard(card);
        }
        return;
      }

      // Обычный режим — добавляем слово
      if (onCardClick) onCardClick(id, categoryId);
    },
    // 🟢 Убираем onLongPress (или оставляем, но он уже не нужен)
    onLongPress: null, // можно удалить совсем
  });

  // Сохраняем cleanup
  container._cardCleanup = cleanup;
}