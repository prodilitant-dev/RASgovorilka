// src/modes/say/Say.categories.js
import { createElement, clear } from '@utils/dom';
import { getElementIds, reorderArray } from '@utils/array';
import { onLongPress } from '@utils/interaction';
import { uid } from '@utils/id';
import { toast } from '@utils/toast';
import { saveProfile } from '@storage/appStorage';
import { getState, setState } from '@state/store';
import { logger } from '@utils/logger';

export function renderCategories(container, profile, activeId, onSelect, onEdit, onReorder) {
  logger.debug('🔄 Rendering Categories');
  
  if (container._dragCleanup) {
    container._dragCleanup();
    container._dragCleanup = null;
  }

  clear(container);
  const state = getState();
  const editing = state.editingMode || false;

  const categories = editing ? profile.categories : profile.categories.filter(c => !c.hidden);

  categories.forEach(cat => {
    const el = createElement('div', {
      className: `category ${cat.id === activeId ? 'active' : ''} ${cat.hidden && editing ? 'category-hidden' : ''}`,
      'data-id': cat.id,
      'data-category-id': cat.id,
    }, cat.name);

    if (editing) {
      el.draggable = true;
    }

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      logger.debug(`Category clicked: ${cat.id}`);
      onSelect(cat.id);
    });

    if (editing && onEdit) {
      onLongPress(el, () => {
        logger.debug(`Category long-pressed: ${cat.id}`);
        onEdit(cat);
      });
    }

    if (editing) {
      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        el.classList.add('drag-over');
      });

      el.addEventListener('dragleave', (e) => {
        el.classList.remove('drag-over');
      });

      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const rawData = e.dataTransfer.getData('text/plain');
        if (!rawData) return;
        try {
          const data = JSON.parse(rawData);
          if (data.type === 'card') {
            const { cardId, sourceCategoryId } = data;
            if (sourceCategoryId === cat.id) {
              toast('Карточка уже в этой категории', 'info');
              return;
            }
            const sourceCards = profile.cards[sourceCategoryId] || [];
            const card = sourceCards.find(c => c.id === cardId);
            if (!card) {
              toast('Карточка не найдена', 'error');
              return;
            }
            const newCard = { ...card, id: uid() };
            if (!profile.cards[cat.id]) profile.cards[cat.id] = [];
            profile.cards[cat.id].push(newCard);
            saveProfile(profile);
            toast(`Карточка скопирована в "${cat.name}"`);
            setState({ currentCategoryId: cat.id });
            onSelect(cat.id);
          }
        } catch (err) {
          logger.error('Drop error:', err);
          toast('Ошибка при копировании карточки', 'error');
        }
      });
    }

    container.appendChild(el);
  });

  if (editing) {
    const addBtn = createElement('div', { className: 'category category-add' }, '+');
    addBtn.addEventListener('click', () => {
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

  if (editing && onReorder) {
    container._dragCleanup = setupDragDrop(container, onReorder);
  }
}

function setupDragDrop(container, onReorder) {
  let draggedId = null;

  const onDragStart = (e) => {
    const el = e.target.closest('.category:not(.category-add)');
    if (!el) return;
    draggedId = el.dataset.id;
    e.dataTransfer.setData('text/plain', draggedId);
    e.dataTransfer.effectAllowed = 'move';
    el.classList.add('dragging');
  };

  const onDragEnd = (e) => {
    const el = e.target.closest('.category:not(.category-add)');
    if (el) el.classList.remove('dragging');
    draggedId = null;
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e) => {
    e.preventDefault();
    const target = e.target.closest('.category:not(.category-add)');
    if (!target) return;
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

  return () => {
    container.removeEventListener('dragstart', onDragStart);
    container.removeEventListener('dragend', onDragEnd);
    container.removeEventListener('dragover', onDragOver);
    container.removeEventListener('drop', onDrop);
  };
}