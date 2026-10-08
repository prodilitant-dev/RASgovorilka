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

  const items = cards.map((c) => ({ ...c }));

  if (editing) {
    items.push({ id: 'add', text: 'Добавить', emoji: '➕', isAdd: true });
  }

  const grid = renderGrid(container, items, {
    draggable: editing,
    onReorder: editing ? (newOrder) => onReorder(newOrder, categoryId) : null,
  });

  function editCard(card) {
    openCardEditor(card, (updatedCard, done) => {
      Object.assign(card, updatedCard);
      saveProfile(profile);
      renderCards(container, profile, categoryId, onCardClick, onReorder);
      toast('Карточка обновлена');
      done();
    }, (cardId, close) => {
      profile.cards[categoryId] = profile.cards[categoryId].filter(c => c.id !== cardId);
      saveProfile(profile);
      renderCards(container, profile, categoryId, onCardClick, onReorder);
      toast('Карточка удалена');
      close();
    });
  }

  // Снимаем предыдущий cleanup событий (клики)
  if (container._cardCleanup) {
    container._cardCleanup();
    container._cardCleanup = null;
  }

  container._cardCleanup = attachGridEvents(grid, {
    onClick: (id) => {
      if (id === 'add') {
        const newCard = { id: uid(), text: '', emoji: '', wordType: 'noun', forms: {} };
        openCardEditor(newCard, (savedCard, done) => {
          if (!savedCard.text.trim()) { toast('Введите текст', 'error'); done(); return; }
          profile.cards[categoryId].push(savedCard);
          saveProfile(profile);
          renderCards(container, profile, categoryId, onCardClick, onReorder);
          toast('Карточка добавлена');
          done();
        }, null);
        return;
      }

      if (editing) {
        const card = cards.find(c => c.id === id);
        if (card) editCard(card);
        return;
      }

      if (onCardClick) onCardClick(id, categoryId);
    },
    onLongPress: null,
  });
}