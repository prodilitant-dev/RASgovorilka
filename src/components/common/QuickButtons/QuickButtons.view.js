// src/components/common/QuickButtons/QuickButtons.view.js
import { createElement, clear, on } from '@utils/dom';
import { getElementIds, reorderArray } from '@utils/array';
import { logger } from '@utils/logger';

export function renderQuickButtons(container, buttons, onSelect, editingMode = false, onReorder = null) {
  logger.debug('🔄 Rendering QuickButtons', { count: buttons.length, editingMode });
  clear(container);

  const wrap = createElement('div', { className: 'quick-buttons' });

  buttons.forEach((btn) => {
    const el = createElement('div', {
      className: 'quick-btn',
      'data-id': btn.id,
      'data-log': `quick-btn:${btn.id}`,
    }, `${btn.emoji || ''} ${btn.text}`);
    if (editingMode) {
      el.setAttribute('draggable', 'true');
    }
    on(el, 'click', () => onSelect(btn));
    wrap.appendChild(el);
  });

  container.appendChild(wrap);

  // Очистка старых обработчиков
  if (container._quickDragCleanup) {
    container._quickDragCleanup();
    container._quickDragCleanup = null;
  }

  if (editingMode && onReorder) {
    let draggedId = null;

    const onDragStart = (e) => {
      const btnEl = e.target.closest('.quick-btn');
      if (!btnEl) return;
      draggedId = btnEl.dataset.id;
      e.dataTransfer.setData('text/plain', draggedId);
      e.dataTransfer.effectAllowed = 'move';
      btnEl.classList.add('dragging');
    };

    const onDragEnd = (e) => {
      const btnEl = e.target.closest('.quick-btn');
      if (btnEl) btnEl.classList.remove('dragging');
      draggedId = null;
    };

    const onDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (e) => {
      e.preventDefault();
      const targetBtn = e.target.closest('.quick-btn');
      if (!targetBtn) return;
      const targetId = targetBtn.dataset.id;
      if (!draggedId || draggedId === targetId) return;

      const ids = getElementIds(wrap, '.quick-btn');
      const fromIdx = ids.indexOf(draggedId);
      const toIdx = ids.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return;

      const newOrder = reorderArray(ids, fromIdx, toIdx);
      onReorder(newOrder);
      draggedId = null;
    };

    wrap.addEventListener('dragstart', onDragStart);
    wrap.addEventListener('dragend', onDragEnd);
    wrap.addEventListener('dragover', onDragOver);
    wrap.addEventListener('drop', onDrop);

    container._quickDragCleanup = () => {
      wrap.removeEventListener('dragstart', onDragStart);
      wrap.removeEventListener('dragend', onDragEnd);
      wrap.removeEventListener('dragover', onDragOver);
      wrap.removeEventListener('drop', onDrop);
    };
  }

  return wrap;
}