// src/modes/stories/components/editor/CardTray.js
import { createElement, on } from '@utils/dom'; // <-- Возвращаем импорты
import { createCard } from '@components/common/Card/Card';
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
      className: 'story-card-tray-item'
    });
    
    const removeBtn = createElement('button', { className: 'editor-mini-card-remove', type: 'button' }, '✕');
    on(removeBtn, 'click', (e) => {
      e.stopPropagation();
      slide.cards.splice(idx, 1);
      onUpdate();
    });
    cardEl.appendChild(removeBtn);

    on(cardEl, 'click', () => {
      openStoryCardModal(card, (updatedCard) => {
        slide.cards[idx] = updatedCard;
        onUpdate();
      });
    });

    tray.appendChild(cardEl);
  });

  const addCardBtn = createElement('button', { className: 'editor-add-card-btn', type: 'button' }, 'Добавить');
  on(addCardBtn, 'click', () => {
    openStoryCardModal(null, (newCard) => {
      slide.cards.push(newCard);
      onUpdate();
    });
  });
  tray.appendChild(addCardBtn);

  return tray;
}