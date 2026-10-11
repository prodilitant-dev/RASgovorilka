// src/utils/dragdrop.js
/**
 * Универсальный сортируемый список.
 * Работает на тач-устройствах и мыши.
 */
export function makeSortable(container, options = {}) {
  const {
    itemSelector = '[data-id]',
    onReorder = null,
    longPressDelay = 200,
    moveTolerance = 8,
    // Элементы внутри item, тап по которым НЕ запускает drag
    ignoreSelector = 'input, button, label, .toggle-switch, .cat-action-btn',
  } = options;

  let draggedEl = null;
  let ghostEl = null;
  let placeholderEl = null;
  let isDragging = false;
  let longPressTimer = null;
  let startX = 0;
  let startY = 0;
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

  const clearTimer = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  const isInteractive = (target) => {
    if (!ignoreSelector) return false;
    return !!target.closest(ignoreSelector);
  };

  const beginDrag = (initX, initY) => {
    isDragging = true;

    const rect = draggedEl.getBoundingClientRect();
    offsetX = initX - rect.left;
    offsetY = initY - rect.top;

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

    placeholderEl = document.createElement('div');
    placeholderEl.className = 'sort-placeholder';
    Object.assign(placeholderEl.style, {
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    draggedEl.parentNode.insertBefore(placeholderEl, draggedEl);

    draggedEl.style.display = 'none';
    draggedEl.classList.add('dragging');
  };

  const moveDrag = (clientX, clientY) => {
    if (!isDragging || !ghostEl) return;

    ghostEl.style.left = `${clientX - offsetX}px`;
    ghostEl.style.top = `${clientY - offsetY}px`;

    const target = findItemAt(clientX, clientY);
    if (!target) return;

    const targetRect = target.getBoundingClientRect();
    const ghostRect = ghostEl.getBoundingClientRect();
    const ghostMidX = ghostRect.left + ghostRect.width / 2;
    const ghostMidY = ghostRect.top + ghostRect.height / 2;

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

    // Снимаем .dragging со всех на всякий случай
    container.querySelectorAll('.dragging').forEach((el) => {
      el.classList.remove('dragging');
    });

    const ids = getItems()
      .map((el) => el.dataset.id)
      .filter(Boolean);

    if (onReorder) onReorder(ids);

    draggedEl = null;
  };

  // ===== Touch =====
  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return;

    const item = e.target.closest(itemSelector);
    if (!item) return;
    if (item.dataset.id === 'add') return;
    if (isInteractive(e.target)) return; // тап по toggle/label/button — игнор

    draggedEl = item;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;

    clearTimer();
    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      if (draggedEl) beginDrag(startX, startY);
    }, longPressDelay);

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchCancel);
  };

  const onTouchMove = (e) => {
    if (!draggedEl) return;

    if (longPressTimer) {
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > moveTolerance) {
        clearTimer();
        cleanupTouchListeners();
        draggedEl = null;
      }
      return;
    }

    if (isDragging) {
      e.preventDefault();
      const t = e.touches[0];
      moveDrag(t.clientX, t.clientY);
    }
  };

  const onTouchEnd = () => {
    clearTimer();
    if (isDragging) endDrag();
    cleanupTouchListeners();
    draggedEl = null;
  };

  const onTouchCancel = () => {
    clearTimer();
    if (isDragging) endDrag();
    cleanupTouchListeners();
    draggedEl = null;
  };

  const cleanupTouchListeners = () => {
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    document.removeEventListener('touchcancel', onTouchCancel);
  };

  // ===== Mouse =====
  const onMouseDown = (e) => {
    if (e.button !== 0) return;

    const item = e.target.closest(itemSelector);
    if (!item) return;
    if (item.dataset.id === 'add') return;
    if (isInteractive(e.target)) return; // тап по toggle/label/button — игнор

    draggedEl = item;
    startX = e.clientX;
    startY = e.clientY;

    clearTimer();
    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      if (draggedEl) beginDrag(startX, startY);
    }, longPressDelay);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!draggedEl) return;

    if (longPressTimer) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > moveTolerance) {
        clearTimer();
        cleanupMouseListeners();
        draggedEl = null;
      }
      return;
    }

    if (isDragging) {
      e.preventDefault();
      moveDrag(e.clientX, e.clientY);
    }
  };

  const onMouseUp = () => {
    clearTimer();
    if (isDragging) endDrag();
    cleanupMouseListeners();
    draggedEl = null;
  };

  const cleanupMouseListeners = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  container.addEventListener('touchstart', onTouchStart, { passive: true });
  container.addEventListener('mousedown', onMouseDown);

  return () => {
    container.removeEventListener('touchstart', onTouchStart);
    container.removeEventListener('mousedown', onMouseDown);
    cleanupTouchListeners();
    cleanupMouseListeners();
    clearTimer();
    if (isDragging) endDrag();
  };
}