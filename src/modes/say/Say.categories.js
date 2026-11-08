// src/modes/say/Say.categories.js
import { createElement, clear } from '@utils/dom';
import { makeSortable } from '@utils/dragdrop';
import { openCategoryCreateModal } from './Say.categoryCreate';
import { getState } from '@state/store';
import { getImageUrl } from '@services/image';
import { logger } from '@utils/logger';
import { createIcon } from '@utils/icon';

export function renderCategories(
  container,
  profile,
  activeId,
  onSelect,
  onEdit,
  onReorder,
  onCreated,
  onLongPress // <-- НОВЫЙ КОЛЛБЭК
) {
  logger.debug('🔄 Rendering Categories');

  if (typeof container._categoriesCleanup === 'function') {
    container._categoriesCleanup();
    container._categoriesCleanup = null;
  }

  clear(container);
  const state = getState();
  const editing = state.editingMode || false;
  const showImages = getState().globalSettings?.categoriesShowImages !== false;

  const categories = editing ? profile.categories : profile.categories.filter((c) => !c.hidden);

  categories.forEach((cat) => {
    const isActive = cat.id === activeId;
    const classes = ['category'];
    if (isActive) classes.push('active');
    if (cat.hidden && editing) classes.push('category-hidden');
    if (editing) classes.push('edit-mode');

    const el = createElement('div', {
      className: classes.join(' '),
      'data-id': cat.id,
      'data-category-id': cat.id,
    });

    if (cat.styleColor) {
      el.style.backgroundColor = isActive ? `${cat.styleColor}80` : `${cat.styleColor}40`;
    } else if (isActive) {
      el.style.backgroundColor = 'var(--surface)';
    }

    if (isActive) {
      el.style.border = '1px solid #000000';
    } else if (cat.styleColor) {
      el.style.borderColor = 'transparent';
    }

    if (showImages) {
      el.classList.add('category--has-avatar');
      el.appendChild(createCategoryAvatar(cat, isActive));
    }

    const nameEl = createElement('span', { className: 'cat-name' }, cat.name);
    if (cat.styleColor || isActive) {
      nameEl.style.color = '#000000';
    }
    el.appendChild(nameEl);

    if (editing && onEdit) {
      const actionsEl = createElement('span', { className: 'cat-actions' });
      const editBtn = createElement('button', {
        type: 'button',
        className: 'cat-action-btn',
        'aria-label': 'Редактировать категорию',
        title: 'Редактировать',
      });
      editBtn.appendChild(
        createIcon('edit', { fallback: '✏️', className: 'cat-action-btn__icon' })
      );
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onEdit(cat);
      });
      actionsEl.appendChild(editBtn);
      el.appendChild(actionsEl);
    }

    // --- ЛОГИКА ДОЛГОГО ТАПА ---
    if (!editing && onLongPress) {
      let pressTimer = null;
      let startX = 0;
      let startY = 0;

      const startPress = (e) => {
        if (e.target.closest('.cat-action-btn')) return;
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;

        pressTimer = setTimeout(() => {
          pressTimer = null;
          if (navigator.vibrate) navigator.vibrate(50);
          onLongPress(cat.id);
        }, 600);
      };

      const cancelPress = () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };

      const movePress = (e) => {
        if (!pressTimer) return;
        const touch = e.touches ? e.touches[0] : e;
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          cancelPress();
        }
      };

      el.addEventListener('touchstart', startPress, { passive: true });
      el.addEventListener('touchmove', movePress, { passive: true });
      el.addEventListener('touchend', cancelPress);
      el.addEventListener('touchcancel', cancelPress);

      el.addEventListener('mousedown', startPress);
      el.addEventListener('mousemove', movePress);
      el.addEventListener('mouseup', cancelPress);
      el.addEventListener('mouseleave', cancelPress);
    }

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelect(cat.id);
    });

    container.appendChild(el);
  });

  if (editing) {
    const addBtn = createElement('div', { className: 'category category-add' });
    addBtn.appendChild(createIcon('add', { fallback: '+', className: 'cat-action-btn__icon' }));
    addBtn.addEventListener('click', () => {
      openCategoryCreateModal(profile, (newCategoryId) => {
        if (onCreated) {
          onCreated(newCategoryId);
        } else {
          renderCategories(
            container,
            profile,
            newCategoryId,
            onSelect,
            onEdit,
            onReorder,
            onCreated,
            onLongPress
          );
        }
      });
    });
    container.appendChild(addBtn);
  }

  let dragCleanup = null;
  if (editing && onReorder) {
    dragCleanup = makeSortable(container, {
      itemSelector: '.category:not(.category-add)',
      longPressDelay: 200,
      onReorder: (ids) => onReorder(ids),
    });
  }

  container._categoriesCleanup = () => {
    if (dragCleanup) dragCleanup();
  };
}

function createCategoryAvatar(cat, isActive) {
  const avatar = createElement('div', { className: 'cat-avatar' });
  const letter = (cat.name || '?').trim().charAt(0).toUpperCase();

  if (isActive) {
    avatar.style.borderColor = '#000000';
    avatar.style.borderWidth = '2px';
    avatar.style.borderStyle = 'solid';
  } else if (cat.styleColor) {
    avatar.style.borderColor = cat.styleColor;
    avatar.style.borderWidth = '2px';
    avatar.style.borderStyle = 'solid';
  }

  if (cat.imageId) {
    avatar.classList.add('cat-avatar--fallback');
    avatar.textContent = letter;

    getImageUrl(cat.imageId)
      .then((url) => {
        if (!url) return;
        const img = createElement('img', {
          src: url,
          alt: '',
          className: 'cat-avatar__img',
          draggable: 'false',
        });
        avatar.textContent = '';
        avatar.classList.remove('cat-avatar--fallback');
        avatar.appendChild(img);
      })
      .catch(() => {});
  } else if (cat.imagePath) {
    const base = import.meta.env.BASE_URL || '/';
    const url = base.endsWith('/') ? `${base}${cat.imagePath}` : `${base}/${cat.imagePath}`;
    const img = createElement('img', {
      src: url,
      alt: '',
      className: 'cat-avatar__img',
      draggable: 'false',
    });
    avatar.appendChild(img);
  } else {
    avatar.classList.add('cat-avatar--fallback');
    avatar.textContent = letter;
  }

  return avatar;
}
