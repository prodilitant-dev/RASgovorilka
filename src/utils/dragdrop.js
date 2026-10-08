// src/utils/dragdrop.js
import { reorderArray } from './array';

/**
 * Универсальный сортируемый список с поддержкой мыши и тач-устройств.
 * Использует Pointer Events API.
 *
 * Старт перетаскивания — после long-press (по умолчанию 200 мс),
 * чтобы не мешать обычному тапу / клику по элементу.
 *
 * @param {HTMLElement} container - контейнер с сортируемыми элементами
 * @param {Object} options
 * @param {string} [options.itemSelector='[data-id]'] - селектор элементов
 * @param {Function} [options.onReorder=null] - (newIds: string[]) => void
 * @param {number} [options.longPressDelay=200] - задержка перед стартом drag (мс)
 * @param {number} [options.moveTolerance=8] - сдвиг до отмены long-press (px)
 * @returns {Function} cleanup
 */
export function makeSortable(container, options = {}) {
  const {
    itemSelector = '[data-id]',
    onReorder = null,
    longPressDelay = 200,
    moveTolerance = 8,
  } = options;

  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let draggedEl = null;
  let ghostEl = null;
  let placeholderEl = null;
  let isDragging = false;
  let longPressTimer = null;
  let offsetX = 0;
  let offsetY = 0;

  const getItems = () =>
    Array.from(container.querySelectorAll(itemSelector)).filter(
      (el) => el.dataset.id !== 'add'
    );

  const findItemAt = (x, y) => {
    for (const el of getItems()) {
      if (el === draggedEl) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return el;
      }
    }
    return null;
  };

  const beginDrag = (initX, initY) => {
    isDragging = true;

    const rect = draggedEl.getBoundingClientRect();
    offsetX = initX - rect.left;
    offsetY = initY - rect.top;

    // Ghost — визуальная копия, следующая за пальцем
    ghostEl = draggedEl.cloneNode(true);
    ghostEl.classList.add('dragging-ghost');
    Object.assign(ghostEl.style, {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      pointerEvents: 'none',
      zIndex: '9999',
    });
    document.body.appendChild(ghostEl);

    // Placeholder — невидимое место, куда вернётся оригинал
    placeholderEl = document.createElement('div');
    placeholderEl.className = 'sort-placeholder';
    Object.assign(placeholderEl.style, {
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    draggedEl.parentNode.insertBefore(placeholderEl, draggedEl);

    // Прячем оригинал
    draggedEl.style.display = 'none';
    draggedEl.classList.add('dragging');
  };

  const moveDrag = (clientX, clientY) => {
    if (!isDragging) return;

    ghostEl.style.left = `${clientX - offsetX}px`;
    ghostEl.style.top = `${clientY - offsetY}px`;

    const target = findItemAt(clientX, clientY);
    if (!target) return;

    const targetRect = target.getBoundingClientRect();
    const ghostRect = ghostEl.getBoundingClientRect();
    const ghostMidX = ghostRect.left + ghostRect.width / 2;
    const ghostMidY = ghostRect.top + ghostRect.height / 2;

    // Определяем, сетка многоколоночная или однолоночная
    const parentStyle = getComputedStyle(target.parentNode);
    const cols = (parentStyle.gridTemplateColumns || '').split(' ').filter(Boolean);
    const isMultiColumn = parentStyle.display === 'grid' && cols.length > 1;

    const before = isMultiColumn
      ? ghostMidX < targetRect.left + targetRect.width / 2
      : ghostMidY < targetRect.top + targetRect.height / 2;

    if (before) {
      if (placeholderEl.nextSibling !== target) {
        target.parentNode.insertBefore(placeholderEl, target);
      }
    } else {
      if (placeholderEl.previousSibling !== target) {
        target.parentNode.insertBefore(placeholderEl, target.nextSibling);
      }
    }
  };

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;

    if (placeholderEl && placeholderEl.parentNode) {
      placeholderEl.parentNode.insertBefore(draggedEl, placeholderEl);
      placeholderEl.remove();
    }
    placeholderEl = null;

    if (draggedEl) {
      draggedEl.style.display = '';
      draggedEl.classList.remove('dragging');
    }

    if (ghostEl) {
      ghostEl.remove();
      ghostEl = null;
    }

    // Собираем новый порядок
    const ids = getItems()
      .map((el) => el.dataset.id)
      .filter(Boolean);

    if (onReorder) onReorder(ids);

    draggedEl = null;
  };

  const cleanupAll = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    if (isDragging) endDrag();
    pointerId = null;
    draggedEl = null;

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const item = e.target.closest(itemSelector);
    if (!item) return;
    if (item.dataset.id === 'add') return;

    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    draggedEl = item;

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);

    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      if (draggedEl) beginDrag(startX, startY);
    }, longPressDelay);
  };

  const onPointerMove = (e) => {
    if (e.pointerId !== pointerId) return;

    // Фаза long-press: если палец сдвинулся — отменяем
    if (longPressTimer && draggedEl) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > moveTolerance) {
        cleanupAll();
      }
      return;
    }

    if (isDragging) {
      e.preventDefault();
      moveDrag(e.clientX, e.clientY);
    }
  };

  const onPointerUp = (e) => {
    if (e.pointerId !== pointerId) return;
    cleanupAll();
  };

  container.addEventListener('pointerdown', onPointerDown);

  return () => {
    container.removeEventListener('pointerdown', onPointerDown);
    cleanupAll();
  };
}