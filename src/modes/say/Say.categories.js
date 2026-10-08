// src/modes/say/Say.categories.js
import { createElement, clear } from '@utils/dom';
import { makeSortable } from '@utils/dragdrop';
import { openCategoryCreateModal } from './Say.categoryCreate';
import { getState } from '@state/store';
import { logger } from '@utils/logger';

export function renderCategories(container, profile, activeId, onSelect, onEdit, onReorder, onCreated) {
  logger.debug('🔄 Rendering Categories');

  if (container._categoriesDragCleanup) {
    container._categoriesDragCleanup();
    container._categoriesDragCleanup = null;
  }

  clear(container);
  const state = getState();
  const editing = state.editingMode || false;

  const categories = editing
    ? profile.categories
    : profile.categories.filter((c) => !c.hidden);

  categories.forEach((cat) => {
    const classes = ['category'];
    if (cat.id === activeId) classes.push('active');
    if (cat.hidden && editing) classes.push('category-hidden');
    if (editing) classes.push('edit-mode');

    const el = createElement('div', {
      className: classes.join(' '),
      'data-id': cat.id,
      'data-category-id': cat.id,
    });

    const nameEl = createElement('span', { className: 'cat-name' }, cat.name);
    el.appendChild(nameEl);

    if (editing && onEdit) {
      const actionsEl = createElement('span', { className: 'cat-actions' });
      const editBtn = createElement(
        'button',
        {
          type: 'button',
          className: 'cat-action-btn',
          'aria-label': 'Редактировать категорию',
          title: 'Редактировать',
        },
        '✏️'
      );
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        logger.debug(`Category edit clicked: ${cat.id}`);
        onEdit(cat);
      });
      actionsEl.appendChild(editBtn);
      el.appendChild(actionsEl);
    }

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      logger.debug(`Category clicked: ${cat.id}`);
      onSelect(cat.id);
    });

    container.appendChild(el);
  });

  // Кнопка «+» — добавить категорию
  if (editing) {
    const addBtn = createElement('div', { className: 'category category-add' }, '+');
    addBtn.addEventListener('click', () => {
      openCategoryCreateModal(profile, (newCategoryId) => {
        if (onCreated) {
          onCreated(newCategoryId);
        } else {
          // fallback: просто перерисуем
          renderCategories(container, profile, newCategoryId, onSelect, onEdit, onReorder, onCreated);
        }
      });
    });
    container.appendChild(addBtn);
  }

  if (editing && onReorder) {
    container._categoriesDragCleanup = makeSortable(container, {
      itemSelector: '.category:not(.category-add)',
      longPressDelay: 200,
      onReorder: (ids) => {
        onReorder(ids);
      },
    });
  }
}