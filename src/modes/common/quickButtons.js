// src/modes/common/quickButtons.js
import { createElement, clear, on } from '@utils/dom';
import { makeSortable } from '@utils/dragdrop';
import { getState } from '@state/store';
import { uid, toast } from '@utils';
import { saveProfile } from '@storage/appStorage';
import { openSimpleEditor } from '@modes/common/editorHelpers';

/**
 * Рендерит быстрые кнопки с поддержкой редактирования, добавления и перетаскивания
 * @param {HTMLElement} container – контейнер для кнопок
 * @param {Object} profile – профиль, содержащий quickButtons
 * @param {Object} options
 * @param {Function} options.onQuickClick – (btn) => void (обычный клик)
 * @param {Function} options.onReorder – (newOrderIds) => void (опционально)
 */
export function renderQuickButtons(container, profile, {
  onQuickClick,
  onReorder,
}) {
  const state = getState();
  const editing = state.editingMode || false;
  const buttons = profile.quickButtons || [];

  clear(container);
  const wrap = createElement('div', { className: 'quick-buttons' });

  // --- Рендерим существующие кнопки ---
  buttons.forEach(btn => {
    const el = createElement('div', {
      className: 'quick-btn',
      'data-id': btn.id,
      draggable: editing ? 'true' : undefined,
    }, `${btn.emoji || ''} ${btn.text}`);

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (editing) {
        // Редактирование кнопки через новый вертикальный редактор
        openSimpleEditor({
          entity: btn,
          title: 'Редактировать кнопку',
          onSave: (updated) => {
            Object.assign(btn, updated);
            saveProfile(profile);
            // Перерисовываем кнопки
            renderQuickButtons(container, profile, { onQuickClick, onReorder });
            toast('Кнопка обновлена');
          },
          onDelete: (id) => {
            profile.quickButtons = profile.quickButtons.filter(b => b.id !== id);
            saveProfile(profile);
            renderQuickButtons(container, profile, { onQuickClick, onReorder });
            toast('Кнопка удалена');
          },
        });
        return;
      }
      // Обычный режим – вызываем колбэк
      if (onQuickClick) onQuickClick(btn);
    });

    wrap.appendChild(el);
  });

  // --- Кнопка добавления (только в режиме редактирования) ---
  if (editing) {
    const addBtn = createElement('div', { className: 'quick-btn' }, '➕');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newBtn = { id: uid(), text: '', emoji: '' };
      openSimpleEditor({
        entity: newBtn,
        title: 'Новая быстрая кнопка',
        onSave: (updated) => {
          if (!updated.text.trim()) {
            toast('Введите текст', 'error');
            return;
          }
          profile.quickButtons.push(updated);
          saveProfile(profile);
          renderQuickButtons(container, profile, { onQuickClick, onReorder });
          toast('Кнопка добавлена');
        },
        onDelete: null, // для новой кнопки удаление не нужно
      });
    });
    wrap.appendChild(addBtn);

    // --- Перетаскивание (drag & drop) ---
    const sortableCleanup = makeSortable(wrap, {
      itemSelector: '.quick-btn:not(:last-child)', // исключаем кнопку "+"
      onReorder: (ids) => {
        const newOrder = ids.map(id => buttons.find(b => b.id === id)).filter(Boolean);
        profile.quickButtons = newOrder;
        saveProfile(profile);
        if (onReorder) onReorder(newOrder.map(b => b.id));
        // Перерисовываем, чтобы обновить порядок
        renderQuickButtons(container, profile, { onQuickClick, onReorder });
      }
    });

    // Сохраняем cleanup для удаления при следующем рендере
    container._quickSortableCleanup = sortableCleanup;
  } else {
    // Удаляем старый cleanup, если был
    if (container._quickSortableCleanup) {
      container._quickSortableCleanup();
      container._quickSortableCleanup = null;
    }
  }

  container.appendChild(wrap);
}