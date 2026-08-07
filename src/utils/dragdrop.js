import { getElementIds, reorderArray } from './array';

export function makeSortable(container, options) {
  const { itemSelector = '[data-id]', onReorder = null } = options;
  let draggedId = null;

  const onDragStart = (e) => {
    const item = e.target.closest(itemSelector);
    if (!item) return;
    draggedId = item.dataset.id;
    e.dataTransfer.setData('text/plain', draggedId);
    e.dataTransfer.effectAllowed = 'move';
    item.classList.add('dragging');
  };

  const onDragEnd = (e) => {
    const item = e.target.closest(itemSelector);
    if (item) item.classList.remove('dragging');
    draggedId = null;
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e) => {
    e.preventDefault();
    const targetItem = e.target.closest(itemSelector);
    if (!targetItem) return;
    const targetId = targetItem.dataset.id;
    if (!draggedId || draggedId === targetId) return;

    const ids = getElementIds(container, itemSelector);
    const fromIndex = ids.indexOf(draggedId);
    const toIndex = ids.indexOf(targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const newOrder = reorderArray(ids, fromIndex, toIndex);
    if (onReorder) onReorder(newOrder);
    draggedId = null;
  };

  container.addEventListener('dragstart', onDragStart);
  container.addEventListener('dragend', onDragEnd);
  container.addEventListener('dragover', onDragOver);
  container.addEventListener('drop', onDrop);

  return () => {
    container.removeEventListener('dragstart', onDragStart);
    container.removeEventListener('dragend', onDragEnd);
    container.removeEventListener('dragover', onDragOver);
    container.removeEventListener('drop', onDrop);
  };
}