// src/utils/dragdrop.js
/**
 * Универсальный сортируемый список.
 * Работает на тач-устройствах и мыши.
 *
 * Логика:
 * - touchstart / mousedown — запускаем таймер long-press.
 * - Если палец сдвинулся > moveTolerance до срабатывания таймера — отменяем
 *   (обычный скролл / клик работает как всегда).
 * - Если таймер сработал — начинаем drag: с этого момента touchmove
 *   вызывает preventDefault, скролл заблокирован до конца жеста.
 * - Если пользователь не двигал палец и отпустил — браузер сам
 *   генерирует click, наш обработчик onClick срабатывает как обычно.
 */
export function makeSortable(container, options = {}) {
  const {
    itemSelector = '[data-id]',
    onReorder = null,
    longPressDelay = 200,
    moveTolerance = 8,
  } = options;

  // Состояние
  let draggedEl = null;
  let ghostEl = null;
  let placeholderEl = null;
  let isDragging = false;
  let longPressTimer = null;
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let currentInputType = null; // 'touch' | 'mouse'

  // === Утилиты ===
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

  const beginDrag = (initX, initY) => {
    isDragging = true;

    const rect = draggedEl.getBoundingClientRect();
    offsetX = initX - rect.left;
    offsetY = initY - rect.top;

    // Ghost — визуальная копия под пальцем
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

    // Placeholder — куда встанет
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
    if (!isDragging || !ghostEl) return;

    ghostEl.style.left = `${clientX - offsetX}px`;
    ghostEl.style.top = `${clientY - offsetY}px`;

    const target = findItemAt(clientX, clientY);
    if (!target) return;

    const targetRect = target.getBoundingClientRect();
    const ghostRect = ghostEl.getBoundingClientRect();
    const ghostMidX = ghostRect.left + ghostRect.width / 2;
    const ghostMidY = ghostRect.top + ghostRect.height / 2;

    // Определяем, многоколоночная ли сетка
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

  // === Touch ===
  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return;

    const item = e.target.closest(itemSelector);
    if (!item) return;
    if (item.dataset.id === 'add') return;

    currentInputType = 'touch';
    draggedEl = item;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;

    clearTimer();
    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      if (draggedEl) beginDrag(startX, startY);
    }, longPressDelay);

    // Слушаем touchmove на document — чтобы работало, даже если палец
    // ушёл за пределы контейнера
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchCancel);
  };

  const onTouchMove = (e) => {
    if (!draggedEl) return;

    // Фаза long-press — если палец сдвинулся, отменяем
    if (longPressTimer) {
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > moveTolerance) {
        clearTimer();
        cleanupTouchListeners();
        draggedEl = null;
        currentInputType = null;
      }
      return;
    }

    // Фаза drag — блокируем скролл и двигаем ghost
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
    currentInputType = null;
  };

  const onTouchCancel = () => {
    clearTimer();
    if (isDragging) endDrag();
    cleanupTouchListeners();
    draggedEl = null;
    currentInputType = null;
  };

  const cleanupTouchListeners = () => {
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    document.removeEventListener('touchcancel', onTouchCancel);
  };

  // === Mouse ===
  const onMouseDown = (e) => {
    if (e.button !== 0) return;

    const item = e.target.closest(itemSelector);
    if (!item) return;
    if (item.dataset.id === 'add') return;

    currentInputType = 'mouse';
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
        currentInputType = null;
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
    currentInputType = null;
  };

  const cleanupMouseListeners = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  // === Подписка ===
  container.addEventListener('touchstart', onTouchStart, { passive: true });
  container.addEventListener('mousedown', onMouseDown);

  // === Cleanup ===
  return () => {
    container.removeEventListener('touchstart', onTouchStart);
    container.removeEventListener('mousedown', onMouseDown);
    cleanupTouchListeners();
    cleanupMouseListeners();
    clearTimer();
    if (isDragging) endDrag();
  };
}