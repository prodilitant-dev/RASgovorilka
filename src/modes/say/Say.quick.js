// src/modes/say/Say.quick.js
import { createElement, clear } from '@utils/dom';
import { makeSortable } from '@utils/dragdrop';
import { getState } from '@state/store';
import { uid } from '@utils/id';
import { toast } from '@utils/toast';
import { saveProfile } from '@storage/appStorage';
import { openCardEditor } from './Say.editor';

export function renderQuickButtons(container, profile, onQuickClick, onReorder) {
  const state = getState();
  const editing = state.editingMode || false;
  const buttons = profile.quickButtons || [];

  clear(container);
  const wrap = createElement('div', { className: 'quick-buttons' });

  // Рендерим существующие кнопки
  buttons.forEach(btn => {
    const el = createElement('div', {
      className: 'quick-btn',
      'data-id': btn.id,
      draggable: editing ? 'true' : undefined,
    }, `${btn.emoji || ''} ${btn.text}`);

    // Клик – либо редактирование, либо добавление в предложение
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (editing) {
        // Редактирование кнопки
        openCardEditor(btn, (updated) => {
          Object.assign(btn, updated);
          saveProfile(profile);
          renderQuickButtons(container, profile, onQuickClick, onReorder);
          toast('Кнопка обновлена');
        }, (id) => {
          profile.quickButtons = profile.quickButtons.filter(b => b.id !== id);
          saveProfile(profile);
          renderQuickButtons(container, profile, onQuickClick, onReorder);
          toast('Кнопка удалена');
        });
        return;
      }
      // Обычный режим – вызываем колбэк
      if (onQuickClick) onQuickClick(btn);
    });

    wrap.appendChild(el);
  });

  // Кнопка добавления (только в режиме редактирования)
  if (editing) {
    const addBtn = createElement('div', { className: 'quick-btn' }, '➕');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newBtn = { id: uid(), text: '', emoji: '' };
      openCardEditor(newBtn, (data) => {
        if (!data.text.trim()) {
          toast('Введите текст', 'error');
          return;
        }
        profile.quickButtons.push(data);
        saveProfile(profile);
        renderQuickButtons(container, profile, onQuickClick, onReorder);
        toast('Кнопка добавлена');
      }, null);
    });
    wrap.appendChild(addBtn);

    // Перетаскивание (drag & drop) – только в режиме редактирования
    const sortableCleanup = makeSortable(wrap, {
      itemSelector: '.quick-btn:not(:last-child)', // исключаем кнопку "+"
      onReorder: (ids) => {
        // ids – массив id кнопок в новом порядке
        const newOrder = ids.map(id => buttons.find(b => b.id === id)).filter(Boolean);
        profile.quickButtons = newOrder;
        saveProfile(profile);
        if (onReorder) onReorder(newOrder.map(b => b.id));
        // Перерисовываем, чтобы обновить порядок
        renderQuickButtons(container, profile, onQuickClick, onReorder);
      }
    });

    // Сохраняем cleanup в контейнере для удаления при перерендере
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