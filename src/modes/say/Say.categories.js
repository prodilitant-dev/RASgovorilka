// src/modes/say/Say.categories.js
import { createElement, clear } from '@utils/dom';
import { uid } from '@utils/id';
import { toast } from '@utils/toast';
import { saveProfile } from '@storage/appStorage';
import { getState, setState } from '@state/store';
import { makeSortable } from '@utils/dragdrop';
import { logger } from '@utils/logger';

export function renderCategories(container, profile, activeId, onSelect, onEdit, onReorder) {
  logger.debug('🔄 Rendering Categories');

  // Снимаем предыдущий cleanup сортировки
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

    const el = createElement(
      'div',
      {
        className: classes.join(' '),
        'data-id': cat.id,
        'data-category-id': cat.id,
      }
    );

    // Название категории (клик → переключение)
    const nameEl = createElement('span', { className: 'cat-name' }, cat.name);
    el.appendChild(nameEl);

    // Кнопка-карандаш (только в режиме редактирования)
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

    // Клик по самой категории — переключение
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
      const name = prompt('Название новой категории:');
      if (name && name.trim()) {
        const newCat = {
          id: uid(),
          name: name.trim(),
          hidden: false,
          wordType: 'noun',
        };
        profile.categories.push(newCat);
        profile.cards[newCat.id] = [];
        saveProfile(profile);
        setState({ currentCategoryId: newCat.id });
        renderCategories(container, profile, newCat.id, onSelect, onEdit, onReorder);
      }
    });
    container.appendChild(addBtn);
  }

  // Drag&drop для изменения порядка категорий (через Pointer Events)
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