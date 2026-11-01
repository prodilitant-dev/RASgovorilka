// src/modes/say/Say.cards.js
import { renderGrid } from '@components/common/Grid/Grid';
import { attachGridEvents } from '@components/common/Grid/Grid.events';
import { getState } from '@state/store';
import { uid } from '@utils/id';
import { toast } from '@utils/toast';
import { openCardEditor } from './Say.editor';
import { saveProfile } from '@storage/appStorage';

export function renderCards(container, profile, categoryId, onCardClick, onReorder) {
  // Снимаем предыдущий cleanup карточек
  if (typeof container._cardsCleanup === 'function') {
    container._cardsCleanup();
    container._cardsCleanup = null;
  }

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

  // Выносим функцию создания карточки, чтобы использовать и в кнопке "+", и в долгом тапе
  const createNewCard = () => {
    const newCard = { id: uid(), text: '', emoji: '', wordType: 'noun', forms: {} };
    openCardEditor(
      newCard,
      (savedCard, done) => {
        if (!savedCard.text.trim()) {
          toast('Введите текст', 'error');
          done();
          return;
        }
        profile.cards[categoryId].push(savedCard);
        saveProfile(profile);
        renderCards(container, profile, categoryId, onCardClick, onReorder);
        toast('Карточка добавлена');
        done();
      },
      null
    );
  };

  const eventsCleanup = attachGridEvents(grid, {
    onClick: (id) => {
      if (id === 'add') {
        createNewCard();
        return;
      }

      if (editing) {
        const card = cards.find((c) => c.id === id);
        if (card) editCard(card);
        return;
      }

      if (onCardClick) onCardClick(id, categoryId);
    },
    onLongPress: null, // Оставляем null, так как логика ниже
  });

  // === ЛОГИКА ДОЛГОГО НАЖАТИЯ (5 СЕК) НА ПУСТОЕ МЕСТО ===
  let longPressTimer = null;
  let startX = 0;
  let startY = 0;

  const onTouchStart = (e) => {
    // Не срабатывает в режиме редактирования
    if (editing) return;
    // Игнорируем, если нажали на карточку (нужно только пустое место)
    if (e.target.closest('.card')) return;

    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;

    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      // Легкая вибрация для отклика, чтобы понять, что таймер сработал
      if (navigator.vibrate) navigator.vibrate(50);
      createNewCard();
    }, 5000); // 5 секунд
  };

  const onTouchMove = (e) => {
    if (!longPressTimer) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    // Если сдвинули палец больше чем на 10px (скролл или свайп) — отменяем
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  const onTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  // Вешаем слушатели на сетку
  grid.addEventListener('touchstart', onTouchStart, { passive: true });
  grid.addEventListener('touchmove', onTouchMove, { passive: true });
  grid.addEventListener('touchend', onTouchEnd, { passive: true });
  grid.addEventListener('touchcancel', onTouchEnd, { passive: true });

  function editCard(card) {
    openCardEditor(
      card,
      (updatedCard, done) => {
        Object.assign(card, updatedCard);
        saveProfile(profile);
        renderCards(container, profile, categoryId, onCardClick, onReorder);
        toast('Карточка обновлена');
        done();
      },
      (cardId, close) => {
        profile.cards[categoryId] = profile.cards[categoryId].filter((c) => c.id !== cardId);
        saveProfile(profile);
        renderCards(container, profile, categoryId, onCardClick, onReorder);
        toast('Карточка удалена');
        close();
      }
    );
  }

  // Единый cleanup карточек
  container._cardsCleanup = () => {
    if (typeof container._gridCleanup === 'function') {
      container._gridCleanup();
      container._gridCleanup = null;
    }
    eventsCleanup();

    // Очищаем таймер и слушатели долгого тапа
    grid.removeEventListener('touchstart', onTouchStart);
    grid.removeEventListener('touchmove', onTouchMove);
    grid.removeEventListener('touchend', onTouchEnd);
    grid.removeEventListener('touchcancel', onTouchEnd);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };
}
