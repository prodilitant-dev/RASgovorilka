// src/components/common/Grid/Grid.js
import { createElement, clear } from '@utils/dom';
import { createCard } from '../Card/Card';
import { logger } from '@utils/logger';

export function renderGrid(container, items, options = {}) {
  logger.debug(`🔄 Rendering Grid with ${items.length} items`);
  clear(container);
  const grid = createElement('div', { className: 'tiles-grid' });

  items.forEach(item => {
    const card = createCard({
      id: item.id,
      text: item.text,
      emoji: item.emoji,
      isActive: item.active || false,
      isAdd: item.isAdd || false,
      draggable: options.draggable || false,
      className: item.className || '',
    });
    grid.appendChild(card);
  });

  container.appendChild(grid);
  logger.debug(`✅ Grid rendered`);
  return grid;
}