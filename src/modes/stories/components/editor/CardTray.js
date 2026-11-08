// src/modes/stories/components/editor/CardTray.js
import { createElement, on } from '@utils/dom';
import { createCard } from '@components/common/Card/Card';
import { createIcon } from '@utils/icon';
import { openStoryCardModal } from '../StoryCardModal';

export function createCardTray(slide, onUpdate) {
  const tray = createElement('div', { className: 'story-editor-cards-tray' });

  slide.cards.forEach((card, idx) => {
    const cardEl = createCard({
      id: card.id,
      text: card.text,
      imageId: card.imageId,
      imagePath: card.imagePath,
      emoji: card.emoji,
      className: 'story-card-tray-item',
    });

    // Кнопка удаления (крестик с иконкой delete)
    const removeBtn = createElement('button', {
      className: 'story-tray-remove-btn',
      type: 'button',
      'aria-label': 'Удалить карточку',
    });

    removeBtn.appendChild(createIcon('delete', { fallback: '✕' }));
    on(cardEl, 'click', () => {
      openStoryCardModal(card, (updatedCard) => {
        slide.cards[idx] = updatedCard;
        onUpdate();
      });
    });

    tray.appendChild(cardEl);
  });

  const addCardBtn = createElement(
    'button',
    { className: 'editor-add-card-btn', type: 'button' },
    'Добавить'
  );
  on(addCardBtn, 'click', () => {
    openStoryCardModal(null, (newCard) => {
      slide.cards.push(newCard);
      onUpdate();
    });
  });
  tray.appendChild(addCardBtn);

  return tray;
}
