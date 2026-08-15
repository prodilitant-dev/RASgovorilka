import { createElement, clear } from '@utils/dom';
import { createCard } from '../Card/Card';
import { logger } from '@utils/logger';
import { getElementIds, reorderArray } from '@utils/array';

export function renderGrid(container, items, options = {}) {
  logger.debug(`🔄 Rendering Grid with ${items.length} items`);
  clear(container);
  const grid = createElement('div', { className: 'tiles-grid' });

  items.forEach(item => {
    const card = createCard({
      id: item.id,
      text: item.text,
      emoji: item.emoji,
      imageId: item.imageId,      // ← добавили
      isActive: item.active || false,
      isAdd: item.isAdd || false,
      draggable: options.draggable || false,
      className: item.className || '',
    });
    grid.appendChild(card);
  });

  container.appendChild(grid);

  // Drag & Drop для перетаскивания внутри сетки (сортировка)
  if (options.draggable && options.onReorder) {
    let draggedId = null;

    const onDragStart = (e) => {
      const cardEl = e.target.closest('.card');
      if (!cardEl) return;
      if (cardEl.dataset.id === 'add') {
        e.preventDefault();
        return;
      }
      draggedId = cardEl.dataset.id;
      e.dataTransfer.setData('text/plain', draggedId);
      e.dataTransfer.effectAllowed = 'move';
      cardEl.classList.add('dragging');
    };

    const onDragEnd = (e) => {
      const cardEl = e.target.closest('.card');
      if (cardEl) cardEl.classList.remove('dragging');
      draggedId = null;
    };

    const onDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (e) => {
      e.preventDefault();
      const targetCard = e.target.closest('.card');
      if (!targetCard) return;
      const targetId = targetCard.dataset.id;
      if (!draggedId || draggedId === targetId || targetId === 'add') return;

      // ✅ Исправляем: передаём селектор '.card'
      const ids = getElementIds(grid, '.card');
      const fromIdx = ids.indexOf(draggedId);
      const toIdx = ids.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return;

      const newOrder = reorderArray(ids, fromIdx, toIdx);
      options.onReorder(newOrder);
      draggedId = null;
    };

    grid.addEventListener('dragstart', onDragStart);
    grid.addEventListener('dragend', onDragEnd);
    grid.addEventListener('dragover', onDragOver);
    grid.addEventListener('drop', onDrop);

    container._gridCleanup = () => {
      grid.removeEventListener('dragstart', onDragStart);
      grid.removeEventListener('dragend', onDragEnd);
      grid.removeEventListener('dragover', onDragOver);
      grid.removeEventListener('drop', onDrop);
    };
  }

  logger.debug(`✅ Grid rendered`);
  return grid;
}