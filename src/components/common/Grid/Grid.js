// src/components/common/Grid/Grid.js
import { createElement, clear } from '@utils/dom';
import { createCard } from '../Card/Card';
import { logger } from '@utils/logger';
import { makeSortable } from '@utils/dragdrop';

export function renderGrid(container, items, options = {}) {
  logger.debug(`🔄 Rendering Grid with ${items.length} items`);

  // Снимаем предыдущий cleanup
  if (container._gridCleanup) {
    container._gridCleanup();
    container._gridCleanup = null;
  }

  clear(container);
  const grid = createElement('div', { className: 'tiles-grid' });

  items.forEach((item) => {
    const card = createCard({
      id: item.id,
      text: item.text,
      emoji: item.emoji,
      imageId: item.imageId,
      imagePath: item.imagePath,
      isActive: item.active || false,
      isAdd: item.isAdd || false,
      className: item.className || '',
    });
    grid.appendChild(card);
  });

  container.appendChild(grid);

  if (options.draggable && options.onReorder) {
    container._gridCleanup = makeSortable(grid, {
      itemSelector: '.card:not(.card--add)',
      onReorder: (ids) => options.onReorder(ids),
    });
  }

  logger.debug(`✅ Grid rendered`);
  return grid;
}