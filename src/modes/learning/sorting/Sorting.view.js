// src/modes/learning/sorting/Sorting.view.js
import { createElement, clear } from '@utils/dom';
import { createCard } from '@components/common/Card/Card';
import { logger } from '@utils/logger';

export function renderSortingGame(container, state, onDrop) {
  logger.debug(`🔄 Rendering Sorting Game, ${state.remainingCards.length} cards left`);
  clear(container);

  const wrap = createElement('div', { className: 'grid-container flex-mode' });
  const area = createElement('div', { className: 'sorting-area' });

  // --- Верхняя часть: карточки для сортировки ---
  const cardsWrap = createElement('div', { className: 'sorting-cards-horizontal' });

  if (state.remainingCards.length === 0) {
    const emptyMsg = createElement('div', {
      style: 'text-align:center; padding:20px; color: var(--text-muted); width:100%;',
    }, '✅ Все карточки отсортированы!');
    cardsWrap.appendChild(emptyMsg);
  } else {
    state.remainingCards.forEach(card => {
      const cardEl = createCard({
        id: card.id,
        text: card.text,
        emoji: card.emoji,
        imageId: card.imageId,
        imagePath: card.imagePath,
        className: 'card--sort',
        draggable: true,
      });

      cardEl.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          type: 'sorting-card',
          id: card.id,
        }));
        e.dataTransfer.effectAllowed = 'move';
        cardEl.classList.add('dragging');
      });

      cardEl.addEventListener('dragend', () => {
        cardEl.classList.remove('dragging');
      });

      cardsWrap.appendChild(cardEl);
    });
  }

  area.appendChild(cardsWrap);

  // --- Нижняя часть: зоны ---
  const zonesWrap = createElement('div', { className: 'sorting-zones' });
  state.zones.forEach(zone => {
    const zoneEl = createElement('div', {
      className: 'sorting-zone',
      'data-category-id': zone.categoryId,
    });

    const title = createElement('div', { className: 'zone-title' }, zone.name);
    zoneEl.appendChild(title);

    const itemsWrap = createElement('div', { className: 'zone-items' });
    zone.items.forEach(item => {
      // ✅ Только текст, без эмодзи
      const itemEl = createElement('span', {
        className: `placed-item ${item.isCorrect ? 'correct' : 'wrong'}`,
      }, item.text);
      itemsWrap.appendChild(itemEl);
    });
    zoneEl.appendChild(itemsWrap);

    zoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zoneEl.classList.add('drag-over');
    });

    zoneEl.addEventListener('dragleave', () => {
      zoneEl.classList.remove('drag-over');
    });

    zoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      zoneEl.classList.remove('drag-over');
      const rawData = e.dataTransfer.getData('text/plain');
      if (!rawData) return;
      try {
        const data = JSON.parse(rawData);
        if (data.type === 'sorting-card') {
          onDrop(data.id, zone.categoryId);
        }
      } catch {
        onDrop(rawData, zone.categoryId);
      }
    });

    zonesWrap.appendChild(zoneEl);
  });

  area.appendChild(zonesWrap);
  wrap.appendChild(area);
  container.appendChild(wrap);
}