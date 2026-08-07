// src/modes/say/Say.categories.js
import { createElement, clear, on } from '@utils/dom';
import { getElementIds, reorderArray } from '@utils/array';
import { onLongPress } from '@utils/interaction';
import { uid } from '@utils/id';
import { toast } from '@utils/toast';
import { saveProfile } from '@storage/appStorage';
import { setState } from '@state/store';

export function renderCategories(container, profile, activeId, onSelect, onEdit, onReorder) {
  clear(container);
  const state = getState();
  const editing = state.editingMode || false;

  const categories = editing ? profile.categories : profile.categories.filter(c => !c.hidden);

  categories.forEach(cat => {
    const el = createElement('div', {
      className: `category ${cat.id === activeId ? 'active' : ''} ${cat.hidden && editing ? 'category-hidden' : ''}`,
      'data-id': cat.id,
    }, cat.name);

    on(el, 'click', () => onSelect(cat.id));

    if (editing && onEdit) {
      onLongPress(el, () => onEdit(cat));
    }

    container.appendChild(el);
  });

  // Кнопка добавления категории (только в режиме редактирования)
  if (editing) {
    const addBtn = createElement('div', { className: 'category category-add' }, '+');
    on(addBtn, 'click', () => {
      const name = prompt('Название новой категории:');
      if (name && name.trim()) {
        const newCat = { id: uid(), name: name.trim(), hidden: false, wordType: 'noun' };
        profile.categories.push(newCat);
        profile.cards[newCat.id] = [];
        saveProfile(profile);
        setState({ currentCategoryId: newCat.id });
        renderCategories(container, profile, newCat.id, onSelect, onEdit, onReorder);
      }
    });
    container.appendChild(addBtn);
  }

  // Drag & Drop для перетаскивания категорий (только в режиме редактирования)
  if (editing && onReorder) {
    setupDragDrop(container, onReorder);
  }
}

function setupDragDrop(container, onReorder) {
  let draggedId = null;

  const onDragStart = (e) => {
    const el = e.target.closest('.category');
    if (!el || el.classList.contains('category-add')) return;
    draggedId = el.dataset.id;
    e.dataTransfer.setData('text/plain', draggedId);
    e.dataTransfer.effectAllowed = 'move';
    el.classList.add('dragging');
  };

  const onDragEnd = (e) => {
    const el = e.target.closest('.category');
    if (el) el.classList.remove('dragging');
    draggedId = null;
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e) => {
    e.preventDefault();
    const target = e.target.closest('.category');
    if (!target || target.classList.contains('category-add')) return;
    const targetId = target.dataset.id;
    if (!draggedId || draggedId === targetId) return;

    const ids = getElementIds(container, '.category:not(.category-add)');
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newOrder = reorderArray(ids, fromIdx, toIdx);
    onReorder(newOrder);
    draggedId = null;
  };

  container.addEventListener('dragstart', onDragStart);
  container.addEventListener('dragend', onDragEnd);
  container.addEventListener('dragover', onDragOver);
  container.addEventListener('drop', onDrop);

  // Очистка (будет вызвана при перерендере)
  container._dragCleanup = () => {
    container.removeEventListener('dragstart', onDragStart);
    container.removeEventListener('dragend', onDragEnd);
    container.removeEventListener('dragover', onDragOver);
    container.removeEventListener('drop', onDrop);
  };
}